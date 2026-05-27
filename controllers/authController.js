import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import UserDetail from '../models/UserDetail.js';
import NotificationToken from '../models/NotificationToken.js';
import { getNextSequenceValue } from '../utils/sequenceGenerator.js';

// In-memory OTP store (email verification)
const emailStore = {};

// ─── Nodemailer transporter (uses env vars) ───────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const { name, email, password, gender, city, mobileNo, dateOfBirth, timeOfBirth } = req.body;
    const profile = req.file?.path;

    if (!password) return res.status(400).json({ message: 'Password is required' });

    const existing = await UserDetail.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const userUid = await getNextSequenceValue('user_uid');
    const hashedPassword = await bcrypt.hash(password, 10);
    const loginToken = crypto.randomBytes(32).toString('hex');

    const newUser = new UserDetail({
      uid: userUid,
      name,
      email,
      password: hashedPassword,
      gender,
      city,
      mobileNo,
      dateOfBirth,
      timeOfBirth,
      profile,
      loginToken,
      wallet: { balance: 0, currency: 'INR' },
      freeMinutesRemaining: 10,
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User registered successfully',
      token: loginToken,
      data: newUser,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserDetail.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isHashedMatch = await bcrypt.compare(password, user.password || '');
    const isLegacyMatch = user.password === password;
    if (!isHashedMatch && !isLegacyMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const loginToken = crypto.randomBytes(32).toString('hex');
    user.loginToken = loginToken;
    await user.save();

    const fcmTokenDoc = await NotificationToken.findOne({ userId: user._id, userType: 'UserDetail' });

    return res.json({
      message: 'Login successful',
      token: loginToken,
      data: { ...user.toObject(), fcmToken: fcmTokenDoc?.fcmToken || null },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// ─── SOCIAL LOGIN ─────────────────────────────────────────────────────────────
export const socialLogin = async (req, res) => {
  try {
    const { email, name, mobileNo, profile } = req.body;

    if (!email && !mobileNo) {
      return res.status(400).json({ message: 'email or mobileNo is required' });
    }

    let user = await UserDetail.findOne(email ? { email } : { mobileNo });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const userUid = await getNextSequenceValue('user_uid');
      const fallbackPassword = await bcrypt.hash(crypto.randomBytes(12).toString('hex'), 10);
      user = await UserDetail.create({
        uid: userUid,
        name: name || '',
        email: email || undefined,
        mobileNo: mobileNo || undefined,
        profile: profile || undefined,
        password: fallbackPassword,
        wallet: { balance: 0, currency: 'INR' },
        freeMinutesRemaining: 10,
      });
    } else {
      if (name && !user.name) user.name = name;
      if (profile && !user.profile) user.profile = profile;
    }

    const profileCompleted = !!(user.name && user.mobileNo && user.email && user.dateOfBirth);
    const loginToken = crypto.randomBytes(32).toString('hex');
    user.loginToken = loginToken;
    await user.save();

    return res.status(200).json({
      message: 'Social login successful',
      token: loginToken,
      isNewUser,
      profileCompleted,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Social login failed', error: err.message });
  }
};

// ─── UPDATE USER ──────────────────────────────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (req.file) updates.profile = req.file.path;

    const updatedUser = await UserDetail.findByIdAndUpdate(id, updates, { new: true });
    return res.json({ message: 'User updated successfully', data: updatedUser });
  } catch (err) {
    return res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// ─── GET USER STATS ───────────────────────────────────────────────────────────
export const getUserStats = async (req, res) => {
  try {
    const [total, male, female] = await Promise.all([
      UserDetail.countDocuments(),
      UserDetail.countDocuments({ gender: 'male' }),
      UserDetail.countDocuments({ gender: 'female' }),
    ]);
    return res.status(200).json({ message: 'User stats fetched', data: { total, male, female } });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch user stats', error: err.message });
  }
};

// ─── GET ALL USERS ────────────────────────────────────────────────────────────
export const getUserList = async (req, res) => {
  try {
    const users = await UserDetail.find().sort({ createdAt: -1 }).populate('following', 'name profilePhoto');
    return res.status(200).json({ message: 'Users fetched successfully', data: users });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// ─── GET USER BY ID ───────────────────────────────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const user = await UserDetail.findById(req.params.id).populate('following', 'name profilePhoto');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({
      message: 'User fetched successfully',
      data: { ...user.toObject(), followingCount: user.following.length },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

// ─── UPDATE FCM TOKEN ─────────────────────────────────────────────────────────
export const updateFcmToken = async (req, res) => {
  try {
    const { id } = req.params;
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ message: 'FCM Token is required' });

    const user = await UserDetail.findByIdAndUpdate(id, { fcmToken }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ message: 'FCM token updated successfully', user });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// ─── SEND OTP (email) ─────────────────────────────────────────────────────────
export const sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = Date.now() + 5 * 60 * 1000;
  emailStore[email] = { otp, expires, verified: false };

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.json({ message: 'OTP generated (SMTP not configured)', otp });
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your verification OTP is ${otp}. It is valid for 5 minutes.`,
    });
    return res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err.message);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// ─── VERIFY OTP (email) ───────────────────────────────────────────────────────
export const verifyOTP = (req, res) => {
  const { email, otp } = req.body;
  const record = emailStore[email];

  if (!record) return res.status(400).json({ message: 'No OTP sent to this email' });
  if (record.verified) return res.status(400).json({ message: 'Email already verified' });
  if (Date.now() > record.expires) return res.status(400).json({ message: 'OTP expired' });
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  emailStore[email].verified = true;
  return res.json({ message: 'Email verified successfully' });
};
