import admin from '../config/fcm.js';
import UserDetail from '../models/UserDetail.js';
import { generateToken } from '../utils/jwtUtils.js';

// ─── FIREBASE PHONE LOGIN ─────────────────────────────────────────────────────
export const firebaseLogin = async (req, res) => {
  try {
    const { idToken, firebaseUid, phone } = req.body;

    if (!idToken || !firebaseUid || !phone) {
      return res.status(400).json({
        success: false,
        message: 'idToken, firebaseUid and phone are required',
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken.uid !== firebaseUid) {
      return res.status(401).json({ success: false, message: 'Invalid Firebase UID' });
    }

    const firebasePhone = decodedToken.phone_number;
    if (!firebasePhone) {
      return res.status(400).json({ success: false, message: 'Phone not found in Firebase token' });
    }

    const cleanFrontendPhone = phone.replace(/\D/g, '').slice(-10);
    const cleanFirebasePhone = firebasePhone.replace(/\D/g, '').slice(-10);

    if (cleanFrontendPhone !== cleanFirebasePhone) {
      return res.status(401).json({ success: false, message: 'Phone number mismatch' });
    }

    let user = await UserDetail.findOne({ mobileNo: cleanFrontendPhone });
    if (!user) {
      user = await UserDetail.create({ mobileNo: cleanFrontendPhone, firebaseUid, isVerified: true });
    }

    const token = generateToken({ userId: user._id, phone: cleanFrontendPhone });
    user.token = token;
    await user.save();

    return res.status(200).json({ success: true, message: 'Authentication successful', data: { token, user } });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired Firebase token: ' + error.message });
  }
};

// ─── GOOGLE LOGIN ─────────────────────────────────────────────────────────────
export const googleLogin = async (req, res) => {
  try {
    const { idToken, fcmToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ID Token required' });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid: firebaseUid, email, name, picture } = decoded;

    let user = await UserDetail.findOne({ firebaseUid });

    if (user) {
      user.loginToken = idToken;
      if (fcmToken) user.fcmToken = fcmToken;
      await user.save();
      return res.status(200).json({ success: true, message: 'Login successful', data: user });
    }

    const lastUser = await UserDetail.findOne().sort({ uid: -1 });
    const newUid = lastUser?.uid ? lastUser.uid + 1 : 1001;

    user = await UserDetail.create({
      uid: newUid,
      firebaseUid,
      name,
      email,
      profile: picture,
      loginToken: idToken,
      fcmToken,
      wallet: { balance: 0, currency: 'INR' },
    });

    return res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
