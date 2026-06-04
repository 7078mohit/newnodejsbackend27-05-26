import crypto from 'crypto';
import PhoneAuth from '../models/PhoneAuth.js';
import UserDetail from '../models/UserDetail.js';
import { generateToken } from '../utils/jwtUtils.js';

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');



// ─── SEND OTP ─────────────────────────────────────────────────────────────────
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required' });
    }

    const existing = await PhoneAuth.findOne({ phone });
    if (existing) {
      const secondsElapsed = (Date.now() - new Date(existing.createdAt).getTime()) / 1000;
      if (secondsElapsed < 60) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(60 - secondsElapsed)}s before requesting a new OTP`,
        });
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await PhoneAuth.findOneAndUpdate(
      { phone },
      { otp: hashOtp(otp), expiresAt, createdAt: new Date() },
      { upsert: true, new: true }
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log(`OTP for ${phone}: ${otp}`);
    }

    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const record = await PhoneAuth.findOne({ phone });
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (record.expiresAt < new Date()) {
      await PhoneAuth.deleteOne({ phone });
      return res.status(400).json({ success: false, message: 'OTP has expired, please request a new one' });
    }

    const hashedInput = hashOtp(otp);
    const isMatch = crypto.timingSafeEqual(Buffer.from(record.otp), Buffer.from(hashedInput));

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    await PhoneAuth.deleteOne({ phone });

    let user = await UserDetail.findOne({ mobileNo: phone });
    const isNewUser = !user;
    if (!user) {
      user = await UserDetail.create({ mobileNo: phone });
    }

    const token = generateToken({ userId: user._id, phone });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        isNewUser,
        user: { _id: user._id, mobileNo: user.mobileNo, createdAt: user.createdAt },
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
