import ChatLog from '../models/chatModel.js';
import admin from '../config/fcm.js';
import NotificationToken from '../models/NotificationToken.js';
import Notification from '../models/Notification.js';
import Astrologer from '../models/Astrologer.js';
import UserDetail from '../models/UserDetail.js';


// ─────────────────────────────────────────────────────────────
// START CHAT API
// ─────────────────────────────────────────────────────────────

export const startChat = async (req, res) => {
  try {
    const { senderId, receiverId, senderProfilePic, senderName, chatId, time, message } = req.body;

    if (!senderId || !receiverId || !chatId || !message) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const chat = await ChatLog.create({ senderId, receiverId, senderName, senderProfilePic, chatId, time, message });

    const tokenDoc = await NotificationToken.findOne({ userId: receiverId });
    if (tokenDoc?.fcmToken) {
      await admin.messaging().sendEachForMulticast({
        tokens: [tokenDoc.fcmToken],
        notification: { title: `${senderName} sent a message`, body: message },
        data: { type: 'chat', senderId: String(senderId), receiverId: String(receiverId), profilePic: senderProfilePic || '', chatId, senderName: senderName || '', message, time: String(time || Date.now()) },
        android: { priority: 'high' },
        apns: { payload: { aps: { 'content-available': 1 } } },
      });
    }

    await Notification.create({ userId: receiverId, userType: 'Astrologer', title: `${senderName} sent a message`, body: message, fcmToken: tokenDoc?.fcmToken || null, isRead: false });

    return res.json({ success: true, message: 'Message sent successfully', data: chat });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error', error: error.message });
  }
};



// ─────────────────────────────────────────────────────────────
// GET USER BY ID API
// ─────────────────────────────────────────────────────────────

export const getUserById = async (req, res) => {
  try {
    const user = await UserDetail.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error', error: error.message });
  }
};


// ─────────────────────────────────────────────────────────────
// GET ASTROLOGER BY ID API
// ─────────────────────────────────────────────────────────────

export const getAstrologerById = async (req, res) => {
  try {
    const astro = await Astrologer.findById(req.params.id);
    if (!astro) return res.status(404).json({ success: false, message: 'Astrologer not found' });
    return res.json({ success: true, data: astro });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error', error: error.message });
  }
};
