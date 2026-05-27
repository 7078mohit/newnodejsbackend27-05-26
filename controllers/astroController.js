import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Astrologer from '../models/Astrologer.js';
import FollowAstrologer from '../models/FollowAstrologer.js';
import { getRatingSummaryForAstros } from '../utils/ratingHelper.js';

const generateEID = () => `KALP${Math.floor(1000 + Math.random() * 9000)}`;

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const parseArrayField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return String(value).split(',').map((v) => v.trim()).filter(Boolean);
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const createAstrologer = async (req, res) => {
  try {
    let profilePhoto = null;
    if (req.files?.length > 0) {
      const file = req.files.find((f) => f.fieldname === 'profilePhoto');
      if (file) profilePhoto = file.path;
    }

    let available_at = req.body.available_at;
    if (typeof available_at === 'string') {
      try { available_at = JSON.parse(available_at); } catch { available_at = {}; }
    }

    const rawPassword = req.body.password || generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newData = {
      ...req.body,
      eid: generateEID(),
      password: hashedPassword,
      isSystemGeneratedPassword: !req.body.password,
      profilePhoto,
      practice: parseArrayField(req.body.practice),
      languages: parseArrayField(req.body.languages),
      skills: parseArrayField(req.body.skills || req.body.specialization),
      available_at: {
        chat: Boolean(available_at?.chat),
        call: Boolean(available_at?.call),
        videoCall: Boolean(available_at?.videoCall),
      },
    };

    const astro = await Astrologer.create(newData);

    return res.status(201).json({
      success: true,
      message: 'Astrologer created successfully',
      data: { ...astro._doc, systemPassword: req.body.password ? undefined : rawPassword },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────
export const getAllAstrologers = async (req, res) => {
  try {
    const { type, userId } = req.query;
    const filter = type ? { [`available_at.${type}`]: true } : {};
    const astrologers = await Astrologer.find(filter).lean();
    const astroIds = astrologers.map((a) => a._id.toString());

    const followMap = await FollowAstrologer.find({ astrologerId: { $in: astroIds }, isFollowed: true })
      .populate('userId', 'name profile email')
      .lean();

    const followerGrouped = {};
    followMap.forEach((f) => {
      const key = f.astrologerId.toString();
      if (!followerGrouped[key]) followerGrouped[key] = [];
      followerGrouped[key].push(f.userId);
    });

    const ratingMap = await getRatingSummaryForAstros(astroIds);

    const finalAstros = astrologers.map((a) => {
      const followers = followerGrouped[a._id.toString()] || [];
      const rating = ratingMap[a._id.toString()] || { averageRating: 0, totalReviews: 0, stars: {} };
      return {
        ...a,
        followers,
        followersCount: followers.length,
        isFollowed: userId ? followers.some((f) => String(f?._id) === String(userId)) : false,
        ratingSummary: rating,
      };
    });

    return res.status(200).json({ success: true, data: finalAstros });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET SINGLE ───────────────────────────────────────────────────────────────
export const getAstrologer = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const astro = await Astrologer.findById(id).lean();
    if (!astro) return res.status(404).json({ success: false, message: 'Not found' });

    const followersData = await FollowAstrologer.find({ astrologerId: id, isFollowed: true })
      .populate('userId', 'name profile email')
      .lean();

    const followers = followersData.map((f) => f.userId);
    const ratingMap = await getRatingSummaryForAstros([id]);
    const ratingSummary = ratingMap[id] || { averageRating: 0, totalReviews: 0, stars: {} };

    return res.status(200).json({
      success: true,
      data: {
        ...astro,
        followers,
        followersCount: followers.length,
        isFollowed: userId ? followers.some((f) => String(f?._id) === String(userId)) : false,
        ratingSummary,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export const updateAstrologer = async (req, res) => {
  try {
    let profilePhoto;
    if (req.files?.length > 0) {
      const file = req.files.find((f) => f.fieldname === 'profilePhoto');
      if (file) profilePhoto = file.path;
    }

    const updateData = { ...req.body };
    if (req.body.available_at) {
      try { updateData.available_at = JSON.parse(req.body.available_at); } catch {}
    }
    if (profilePhoto) updateData.profilePhoto = profilePhoto;

    const updated = await Astrologer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const deleteAstrologer = async (req, res) => {
  try {
    await Astrologer.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Astrologer deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const loginAstro = async (req, res) => {
  try {
    const { eid, number, email, password } = req.body;
    const clauses = [];
    if (eid) clauses.push({ eid });
    if (number) clauses.push({ number });
    if (email) clauses.push({ email });

    if (!clauses.length || !password) {
      return res.status(400).json({ success: false, message: 'Login ID and password are required' });
    }

    const astro = await Astrologer.findOne({ $or: clauses });
    if (!astro) return res.status(404).json({ success: false, message: 'Astrologer not found' });

    const isMatch = await bcrypt.compare(password, astro.password || '');
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid password' });

    if (astro.isSystemGeneratedPassword) {
      return res.status(200).json({
        success: true,
        resetRequired: true,
        message: 'Password reset required before login',
        eid: astro.eid,
        number: astro.number,
      });
    }

    const loginToken = crypto.randomBytes(32).toString('hex');
    astro.loginToken = loginToken;
    await astro.save();

    const astroSafe = astro.toObject();
    delete astroSafe.password;

    return res.status(200).json({ success: true, message: 'Login successful', token: loginToken, data: astroSafe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SEND RESET OTP ───────────────────────────────────────────────────────────
export const sendResetOtp = async (req, res) => {
  try {
    const { eid } = req.body;
    const astro = await Astrologer.findOne({ eid });
    if (!astro) return res.status(404).json({ success: false, message: 'Astrologer not found' });

    // TODO: integrate real SMS OTP service
    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VERIFY OTP & RESET PASSWORD ─────────────────────────────────────────────
export const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { eid, otp, newPassword } = req.body;

    // TODO: replace with real OTP verification
    if (otp !== '1234') {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const astro = await Astrologer.findOne({ eid });
    if (!astro) return res.status(404).json({ success: false, message: 'Astrologer not found' });

    astro.password = await bcrypt.hash(newPassword, 10);
    astro.isSystemGeneratedPassword = false;
    await astro.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE AVAILABILITY (available_at) ──────────────────────────────────────
export const updateAstrologerAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { chat, call, videoCall } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid astrologer ID' });
    }

    const update = {};
    if (typeof chat === 'boolean') update['available_at.chat'] = chat;
    if (typeof call === 'boolean') update['available_at.call'] = call;
    if (typeof videoCall === 'boolean') update['available_at.videoCall'] = videoCall;

    if (!Object.keys(update).length) {
      return res.status(400).json({ success: false, message: 'No availability fields provided' });
    }

    const astrologer = await Astrologer.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!astrologer) return res.status(404).json({ success: false, message: 'Astrologer not found' });

    return res.status(200).json({ success: true, message: 'Availability updated', data: { _id: astrologer._id, available_at: astrologer.available_at } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
