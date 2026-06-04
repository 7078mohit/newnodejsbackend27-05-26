import express from 'express';
import {
  saveFcmToken,
  updateFcmToken,
  createNotification,
  sendNotification,
  getAllNotifications,
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
router.get("/getAll", getAllNotifications);

router.post("/send", sendNotification);


router.get("/get-user-notification", getUserNotifications);

router.patch("/mark-as-read/:id", markAsRead);

router.get("/get-unread-count", getUnreadCount);


export default router;
