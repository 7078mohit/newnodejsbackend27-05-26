import agoraAccessToken from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = agoraAccessToken;
import Astrologer from '../models/Astrologer.js';
import NotificationToken from '../models/NotificationToken.js';
import Review from '../models/Review.js';


// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const registerAstrologer = async (req, res) => {
  try {
    const { name, number, email, experience, skills } = req.body;
    const profilePhoto = req.file?.path || null;

    const astrologer = new Astrologer({ name, number, email, experience, skills, profilePhoto });
    await astrologer.save();

    return res.status(201).json({ success: true, message: 'Astrologer registered successfully', data: astrologer });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const loginAstrologer = async (req, res) => {
  try {
    const { loginId } = req.body;
    if (!loginId) return res.status(400).json({ success: false, message: 'Email or phone number is required' });

    const astrologer = await Astrologer.findOne({ $or: [{ email: loginId }, { number: loginId }] });
    if (!astrologer) return res.status(404).json({ success: false, message: 'Astrologer not found' });

    const fcmTokenDoc = await NotificationToken.findOne({ userId: astrologer._id, userType: 'Astrologer' });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { ...astrologer.toObject(), fcmToken: fcmTokenDoc?.fcmToken || null },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};




// ─── UPDATE PROFILE PHOTO ─────────────────────────────────────────────────────
export const updateProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const profilePhoto = req.file?.path || null;
    if (!profilePhoto) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const updated = await Astrologer.findByIdAndUpdate(id, { profilePhoto }, { new: true });
    return res.status(200).json({ success: true, message: 'Profile photo updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// ─── GET ALL ASTROLOGERS ──────────────────────────────────────────────────────
export const getAllAstrologers = async (req, res) => {
  try {
    const { name, experience, skills, page, limit } = req.query;
    const filter = {};

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (experience) filter.experience = { $regex: String(experience), $options: 'i' };
    if (skills) {
      const skillArray = Array.isArray(skills)
        ? skills
        : String(skills).split(',').map((s) => s.trim()).filter(Boolean);
      filter.skills = { $in: skillArray };
    }

    const currentPage = Number(page || 1);
    const perPage = Number(limit || 0);
    const usePagination = Number.isFinite(perPage) && perPage > 0;

    let query = Astrologer.find(filter).sort({ createdAt: -1 });
    if (usePagination) query = query.skip((currentPage - 1) * perPage).limit(perPage);

    const [astrologers, totalCount] = await Promise.all([query, Astrologer.countDocuments(filter)]);

    const enriched = await Promise.all(
      astrologers.map(async (astro) => {
        const reviews = await Review.find({ astrologerId: astro._id })
          .populate('userId', 'name profile')
          .sort({ createdAt: -1 });

        const ratingData = await Review.aggregate([
          { $match: { astrologerId: astro._id } },
          { $group: { _id: '$astrologerId', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
        ]);

        return {
          ...astro.toObject(),
          reviews,
          averageRating: ratingData.length ? ratingData[0].avgRating.toFixed(1) : '0.0',
          totalReviews: ratingData.length ? ratingData[0].totalReviews : 0,
          callType: ['voice', 'videocall', 'chat'],
          availabilityStatus: astro.status === 'live' ? 'online' : 'offline',
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Astrologers fetched successfully',
      currentPage,
      perPage: usePagination ? perPage : totalCount,
      totalCount,
      totalPages: usePagination ? Math.ceil(totalCount / perPage) : 1,
      data: enriched,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



// ─── GET ASTROLOGER BY ID ─────────────────────────────────────────────────────
export const getAstrologerById = async (req, res) => {
  try {
    const astrologer = await Astrologer.findById(req.params.id);
    if (!astrologer) return res.status(404).json({ success: false, message: 'Astrologer not found' });
    return res.status(200).json({ success: true, message: 'Astrologer fetched', data: astrologer });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



// ─── GET ASTROLOGER STATS ─────────────────────────────────────────────────────
export const getAstrologerStats = async (req, res) => {
  try {
    const [total, active, inactive] = await Promise.all([
      Astrologer.countDocuments(),
      Astrologer.countDocuments({ status: 'live' }),
      Astrologer.countDocuments({ status: 'offline' }),
    ]);
    return res.status(200).json({ message: 'Astrologer stats fetched', data: { total, active, inactive } });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch astrologer stats', error: err.message });
  }
};

// ─── GET DROPDOWN OPTIONS ─────────────────────────────────────────────────────
export const getDropdownOptions = async (req, res) => {
  return res.status(200).json({
    message: 'Dropdown options fetched',
    data: {
      categories: ['Vedic', 'Tarot', 'Numerology', 'KP', 'Palmistry'],
      skills: ['Love', 'Career', 'Marriage', 'Business', 'Health'],
      languages: ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'],
      qualifications: ['Diploma in Astrology', 'BA Astrology', 'MA Astrology', 'PhD Astrology', 'Self Taught', 'Others'],
    },
  });
};


// ─── DELETE ASTROLOGER ────────────────────────────────────────────────────────
export const deleteAstrologer = async (req, res) => {
  try {
    const deleted = await Astrologer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Astrologer not found' });
    return res.status(200).json({ message: 'Astrologer deleted successfully', data: deleted });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// ─── UPDATE AVAILABILITY (chat/call/videoCall booleans) ───────────────────────
export const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { chat, call, videoCall } = req.body;

    const astrologer = await Astrologer.findById(id);
    if (!astrologer) return res.status(404).json({ success: false, message: 'Astrologer not found' });

    if (chat !== undefined) astrologer.availability.chat = chat;
    if (call !== undefined) astrologer.availability.call = call;
    if (videoCall !== undefined) astrologer.availability.videoCall = videoCall;

    await astrologer.save();
    return res.status(200).json({ success: true, message: 'Availability updated', data: astrologer.availability });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



// ─── UPDATE AVAILABILITY STATUS (live/offline + Agora token) ─────────────────
export const updateAvailabilityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['live', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const APP_ID = process.env.AGORA_APP_ID;
    const APP_CERTIFICATE = process.env.AGORA_APP_CERT;

    let updateData = { status };

    if (status === 'live' && APP_ID && APP_CERTIFICATE) {
      const uid = Date.now();
      const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600;
      const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID, APP_CERTIFICATE, id, uid, RtcRole.PUBLISHER, privilegeExpiredTs
      );
      updateData = { ...updateData, agoraToken: token, channelId: id, uid };
    } else if (status === 'offline') {
      updateData = { ...updateData, agoraToken: null, channelId: null, uid: null };
    }

    const updated = await Astrologer.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Astrologer not found' });

    return res.status(200).json({ message: `Status updated to ${status}`, profile: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// ─── GET LIVE ASTROLOGERS ─────────────────────────────────────────────────────
export const getLiveAstrologers = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      Astrologer.find({ status: 'live' }).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      Astrologer.countDocuments({ status: 'live' }),
    ]);

    return res.status(200).json({ message: 'Live astrologers', page, pageSize: limit, total, count: rows.length, profiles: rows });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// ─── APPROVE ASTROLOGER ───────────────────────────────────────────────────────
export const approveAstrologer = async (req, res) => {
  try {
    const astrologer = await Astrologer.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!astrologer) return res.status(404).json({ message: 'Astrologer not found' });
    return res.status(200).json({ message: 'Astrologer approved', data: astrologer });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
