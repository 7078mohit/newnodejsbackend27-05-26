import express from 'express';
import {
  saveFcmToken,
  updateFcmToken,
  createNotification,
  sendNotification,
  getNotifications,
  getUserNotifications,
  markAsRead,
  getUnreadCount,
} from '../controllers/notificationController.js';

const router = express.Router();

// Save new token
router.post("/save-token", saveFcmToken);

// Update existing token
router.put("/update-token", updateFcmToken);

router.post("/create", createNotification);

// Fetch all or by user/astrologer id
router.get("/list", getNotifications);

router.post("/send-notification", sendNotification);


router.get("/UserNotification", getUserNotifications);
router.patch("/read/:id", markAsRead);
router.get("/unread-count", getUnreadCount);


export default router;
