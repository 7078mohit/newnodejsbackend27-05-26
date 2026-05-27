import mongoose from 'mongoose';
import CallLog from '../models/callModel.js';
import admin from '../config/fcm.js';
import NotificationToken from '../models/NotificationToken.js';
import Notification from '../models/Notification.js';
import FollowAstrologer from '../models/FollowAstrologer.js';
import { canAffordSessionStart, chargeUserUsage } from '../utils/billing.js';

const getDateRange = (filter) => {
  const now = new Date();
  let start;
  switch (filter) {
    case 'day':
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week': {
      const first = now.getDate() - now.getDay();
      start = new Date(now.setDate(first));
      start.setHours(0, 0, 0, 0);
      break;
    }
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      start = null;
  }
  return { start, end: new Date() };
};

// ─── START CALL ───────────────────────────────────────────────────────────────
export const startCall = async (req, res) => {
  try {
    const { callerId, receiverId, callType, channelName, callerName, profilePic } = req.body;

    if (!callerId || !receiverId || !callType || !channelName) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const normalizedType = callType === 'live' ? 'stream' : callType;
    const persistedType = callType === 'stream' ? 'live' : callType;
    const io = req.app.get('io');

    const existingCall = await CallLog.findOne({ channelName });
    if (existingCall) return res.json({ success: true, message: 'Call already started', data: existingCall });

    const affordability = await canAffordSessionStart({
      userId: callerId,
      astrologerId: receiverId,
      serviceType: persistedType === 'live' ? 'video' : persistedType,
    });

    if (!affordability.ok) {
      return res.status(402).json({ success: false, message: affordability.message || 'Insufficient balance', data: affordability });
    }

    const call = await CallLog.create({
      callerId,
      receiverId,
      callType: persistedType,
      channelName,
      status: 'ringing',
      duration: 0,
      ratePerMinute: affordability.ratePerMinute || 0,
      totalEarning: 0,
    });

    if (io) {
      io.to(`user:${receiverId}`).emit('incomingCall', {
        ...call.toObject(),
        callerName: callerName || 'User',
        profilePic: profilePic || '',
      });
    }

    let tokens = [];
    let receiverToken = null;

    if (['voice', 'video', 'chat'].includes(normalizedType)) {
      const tokenDoc = await NotificationToken.findOne({ userId: receiverId });
      receiverToken = tokenDoc?.fcmToken || null;
      if (receiverToken) tokens.push(receiverToken);
    }

    if (normalizedType === 'stream') {
      const followersData = await FollowAstrologer.find({ astrologerId: receiverId, isFollowed: true })
        .populate('userId', 'name profile email')
        .lean();
      const followerIds = followersData.map((f) => f.userId?._id).filter(Boolean);
      if (followerIds.length > 0) {
        const tokenDocs = await NotificationToken.find({ userId: { $in: followerIds }, fcmToken: { $exists: true, $ne: null } }).select('fcmToken');
        tokens = tokenDocs.map((t) => t.fcmToken);
      }
    }

    let title = 'Incoming Session';
    let body = `${callerName || 'Someone'} started a session.`;
    if (normalizedType === 'stream') { title = 'Live Stream Started'; body = `Join now, ${callerName || 'Astrologer'} is live.`; }
    else if (normalizedType === 'voice') { title = 'Incoming Voice Call'; body = `${callerName || 'User'} is calling you.`; }
    else if (normalizedType === 'video') { title = 'Incoming Video Call'; body = `${callerName || 'User'} started a video call.`; }
    else if (normalizedType === 'chat') { title = 'New Chat Session'; body = `${callerName || 'User'} started a chat session.`; }

    if (tokens.length > 0) {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: { type: 'incoming_call', callerId: String(callerId), receiverId: String(receiverId), callType: persistedType, channelName, callerName: String(callerName || ''), profilePic: String(profilePic || '') },
        android: { priority: 'high' },
        apns: { payload: { aps: { 'content-available': 1 } } },
      });
    }

    await Notification.create({ userId: receiverId, userType: 'Astrologer', title, body, fcmToken: receiverToken, isRead: false });

    return res.json({ success: true, message: 'Call started', data: call });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', error: error.message });
  }
};

// ─── UPDATE CALL STATUS ───────────────────────────────────────────────────────
export const updateCallStatus = async (req, res) => {
  try {
    const { channelName, status } = req.body;
    const io = req.app.get('io');

    if (!channelName || !status) return res.status(400).json({ message: 'channelName & status required' });

    const call = await CallLog.findOne({ channelName });
    if (!call) return res.status(404).json({ message: 'Call not found' });

    if (['rejected', 'missed', 'ended'].includes(status)) {
      call.endTime = new Date();
      call.duration = new Date(call.endTime) - new Date(call.createdAt);
    }

    call.status = status;

    if (status === 'ended' && call.duration > 0) {
      const billType = call.callType === 'live' ? 'video' : call.callType;
      const minutes = call.duration / 60000;
      const charge = await chargeUserUsage({ userId: call.callerId, astrologerId: call.receiverId, serviceType: billType, minutes, allowPartial: true });
      if (charge.ok) {
        call.ratePerMinute = charge.ratePerMinute || call.ratePerMinute;
        call.totalEarning = charge.deductedAmount || 0;
      }
    }

    await call.save();

    if (io) {
      io.to(`user:${String(call.callerId)}`).emit('callStatusChanged', { channelName: call.channelName, status: call.status });
      io.to(`user:${String(call.receiverId)}`).emit('callStatusChanged', { channelName: call.channelName, status: call.status });
    }

    return res.json({ success: true, message: 'Call status updated', data: call });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', error: error.message });
  }
};

// ─── GET INCOMING CALLS ───────────────────────────────────────────────────────
export const getIncomingCalls = async (req, res) => {
  try {
    const { astroId } = req.params;
    if (!astroId) return res.status(400).json({ success: false, message: 'Astrologer ID required' });

    const calls = await CallLog.find({ receiverId: astroId, status: 'ringing' }).sort({ createdAt: -1 }).limit(20);
    return res.json({ success: true, count: calls.length, data: calls });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error', error: error.message });
  }
};

// ─── GET CALL HISTORY ─────────────────────────────────────────────────────────
export const getCallHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    const filter = { $or: [{ callerId: userId }, { receiverId: userId }] };
    if (type) {
      if (!['chat', 'voice', 'video', 'live'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid type' });
      }
      filter.callType = type;
    }

    const logs = await CallLog.find(filter)
      .populate('callerId', 'name profilePhoto')
      .populate('receiverId', 'name profilePhoto')
      .sort({ createdAt: -1 });

    return res.json({ success: true, message: 'Call history fetched', count: logs.length, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error', error: error.message });
  }
};

// ─── GET EARNINGS ─────────────────────────────────────────────────────────────
export const getEarnings = async (req, res) => {
  try {
    const { astroId } = req.params;
    const { filter, type } = req.query;

    if (!astroId) return res.status(400).json({ success: false, message: 'Astrologer ID required' });

    const query = { receiverId: astroId, status: 'ended' };
    if (type) {
      if (!['chat', 'voice', 'video', 'live'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid type' });
      }
      query.callType = type;
    }
    if (filter) {
      const { start, end } = getDateRange(filter);
      if (start) query.createdAt = { $gte: start, $lte: end };
    }

    const calls = await CallLog.find(query);
    let totalEarning = 0;
    let totalMinutes = 0;
    const transactions = [];

    for (const call of calls) {
      const mins = call.duration / 60000;
      const earning = mins * call.ratePerMinute;
      totalMinutes += mins;
      totalEarning += earning;
      if (!call.totalEarning || call.totalEarning === 0) {
        call.totalEarning = earning;
        await call.save();
      }
      transactions.push({
        sessionId: call._id,
        callType: call.callType,
        durationMinutes: mins.toFixed(2),
        ratePerMinute: call.ratePerMinute,
        amount: earning.toFixed(2),
        date: call.createdAt,
      });
    }

    return res.json({
      success: true,
      data: {
        filter: filter || 'all',
        type: type || 'all',
        totalCalls: calls.length,
        totalMinutes: totalMinutes.toFixed(2),
        totalEarning: totalEarning.toFixed(2),
        currency: 'INR',
        transactions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error', error: error.message });
  }
};

// ─── GET ASTROLOGER WALLET ────────────────────────────────────────────────────
export const getWallet = async (req, res) => {
  try {
    const { astroId } = req.params;
    const { filter, type } = req.query;

    if (!astroId) return res.status(400).json({ success: false, message: 'Astrologer ID required' });

    const query = { receiverId: astroId, status: 'ended' };
    if (type) {
      if (!['chat', 'voice', 'video', 'live'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid type' });
      }
      query.callType = type;
    }
    if (filter) {
      const { start, end } = getDateRange(filter);
      if (start && end) query.createdAt = { $gte: start, $lte: end };
    }

    const logs = await CallLog.find(query).sort({ createdAt: -1 });
    let totalMinutes = 0;
    let walletBalance = 0;
    const transactions = [];

    for (const call of logs) {
      const mins = call.duration / 60000;
      const earning = mins * (call.ratePerMinute || 10);
      totalMinutes += mins;
      walletBalance += earning;
      if (!call.totalEarning || call.totalEarning === 0) {
        call.totalEarning = earning;
        await call.save();
      }
      transactions.push({ sessionId: call._id, callType: call.callType, durationMinutes: mins.toFixed(2), amount: earning.toFixed(2), date: call.createdAt });
    }

    return res.json({
      success: true,
      data: { filter: filter || 'all', type: type || 'all', totalSessions: logs.length, totalMinutes: totalMinutes.toFixed(2), walletBalance: walletBalance.toFixed(2), currency: 'INR', transactions },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error', error: error.message });
  }
};

// ─── GET ASTRO DASHBOARD ──────────────────────────────────────────────────────
export const getAstroDashboard = async (req, res) => {
  try {
    const { astroId } = req.params;
    const { filter } = req.query;

    if (!astroId) return res.status(400).json({ success: false, message: 'Astrologer ID required' });

    const query = { receiverId: astroId, status: 'ended' };
    if (filter) {
      const { start, end } = getDateRange(filter);
      if (start) query.createdAt = { $gte: start, $lte: end };
    }

    const logs = await CallLog.find(query);
    const summary = { voice: { count: 0, minutes: 0, earning: 0 }, video: { count: 0, minutes: 0, earning: 0 }, chat: { count: 0, minutes: 0, earning: 0 }, live: { count: 0, minutes: 0, earning: 0 }, totalEarning: 0 };

    logs.forEach((call) => {
      const mins = call.duration / 60000;
      const earning = mins * (call.ratePerMinute || 10);
      if (summary[call.callType]) {
        summary[call.callType].count += 1;
        summary[call.callType].minutes += mins;
        summary[call.callType].earning += earning;
      }
      summary.totalEarning += earning;
    });

    return res.json({
      success: true,
      message: 'Astrologer dashboard fetched',
      filter: filter || 'all',
      data: {
        voice: { sessions: summary.voice.count, minutes: summary.voice.minutes.toFixed(2), earning: summary.voice.earning.toFixed(2) },
        video: { sessions: summary.video.count, minutes: summary.video.minutes.toFixed(2), earning: summary.video.earning.toFixed(2) },
        chat: { sessions: summary.chat.count, minutes: summary.chat.minutes.toFixed(2), earning: summary.chat.earning.toFixed(2) },
        live: { sessions: summary.live.count, minutes: summary.live.minutes.toFixed(2), earning: summary.live.earning.toFixed(2) },
        totalEarning: summary.totalEarning.toFixed(2),
        currency: 'INR',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error', error: error.message });
  }
};
