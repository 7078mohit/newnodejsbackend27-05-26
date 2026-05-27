import mongoose from 'mongoose';
import NotificationToken from '../models/NotificationToken.js';
import Notification from '../models/Notification.js';
import FollowAstrologer from '../models/FollowAstrologer.js';
import admin from '../config/fcm.js';

export const saveFcmToken = async (req, res) => {
  try {
    const { userId, fcmToken, deviceType } = req.body;
    const userType = req.body.userType === 'astroModel' ? 'Astrologer' : req.body.userType;

    if (!userId || !userType || !fcmToken) {
      return res.status(400).json({ message: 'userId, userType and fcmToken are required' });
    }
    if (!['UserDetail', 'Astrologer'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid userType' });
    }

    const existing = await NotificationToken.findOne({ userId });
    if (existing) {
      const updated = await NotificationToken.findOneAndUpdate({ userId }, { fcmToken, deviceType }, { new: true });
      return res.status(200).json({ message: 'FCM token updated', data: updated });
    }

    const newToken = new NotificationToken({ userId, userType, fcmToken, deviceType });
    await newToken.save();
    return res.status(201).json({ message: 'FCM token saved', data: newToken });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateFcmToken = async (req, res) => {
  try {
    const { oldToken, newToken } = req.body;
    if (!oldToken || !newToken) return res.status(400).json({ message: 'oldToken and newToken are required' });

    const tokenDoc = await NotificationToken.findOne({ fcmToken: oldToken });
    if (!tokenDoc) return res.status(404).json({ message: 'Old token not found' });

    tokenDoc.fcmToken = newToken;
    await tokenDoc.save();
    return res.json({ message: 'FCM token updated', data: tokenDoc });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { userId, userType, title, body } = req.body;
    if (!userId || !userType || !title || !body) return res.status(400).json({ message: 'All fields are required' });
    if (!['UserDetail', 'Astrologer'].includes(userType)) return res.status(400).json({ message: 'Invalid userType' });

    const notification = await Notification.create({ userId, userType, title, body, isRead: false });
    return res.status(201).json({ message: 'Notification created', data: notification });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { userId, userType } = req.query;
    const query = userId && userType ? { userId, userType } : {};
    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    return res.json({ message: 'Notifications fetched', data: notifications });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const sendNotification = async (req, res) => {
  try {
    const { name, profilePic, id, type, channelName, fcmToken, userType } = req.body;

    if (!name || !id || !type || !channelName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const receiverType = userType || 'UserDetail';
    let tokens = [];

    if (type === 'voice' || type === 'video') {
      if (!fcmToken) return res.status(400).json({ success: false, message: 'FCM token required for voice/video' });
      tokens.push(fcmToken);
    }

    if (type === 'stream') {
      const followersData = await FollowAstrologer.find({ astrologerId: id, isFollowed: true })
        .populate('userId', 'name profile email')
        .lean();
      const followers = followersData.map((f) => f.userId?._id).filter(Boolean);
      if (followers.length === 0) return res.status(200).json({ success: true, message: 'No followers to notify' });

      const tokenDocs = await NotificationToken.find({ userId: { $in: followers }, fcmToken: { $exists: true, $ne: null } }).select('fcmToken');
      tokens = tokenDocs.map((t) => t.fcmToken);
    }

    const savedNotification = await Notification.create({
      userId: id,
      userType: receiverType,
      title: `${name} started a ${type}`,
      body: `Channel: ${channelName}`,
      isRead: false,
    });

    let fcmResponse = null;
    if (tokens.length > 0) {
      try {
        fcmResponse = await admin.messaging().sendEachForMulticast({
          tokens,
          notification: { title: `Starting ${type} call`, body: `${name} started a ${type} call. Join now!` },
          data: { type: 'incoming_call', callerName: String(name), profilePic: String(profilePic || ''), callerId: String(id), receiverId: String(id), callType: String(type), channelName: String(channelName) },
          android: { priority: 'high' },
          apns: { payload: { aps: { 'content-available': 1 } } },
        });
      } catch (fcmErr) {
        console.error('FCM Error:', fcmErr.message);
      }
    }

    return res.json({ success: true, message: 'Notification saved & processed', data: savedNotification, fcmResponse });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const { userId, notificationId } = req.query;
    if (!userId && !notificationId) return res.status(400).json({ success: false, message: 'userId or notificationId is required' });

    const query = {};
    if (notificationId) {
      if (!mongoose.Types.ObjectId.isValid(notificationId)) return res.status(400).json({ success: false, message: 'Invalid notificationId' });
      query._id = notificationId;
    }
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: 'Invalid userId' });
      query.userId = userId;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid notification id' });

    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    return res.json({ success: true, data: notification });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ success: false, message: 'Invalid userId' });

    const count = await Notification.countDocuments({ userId, isRead: false });
    return res.json({ success: true, data: { count } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
