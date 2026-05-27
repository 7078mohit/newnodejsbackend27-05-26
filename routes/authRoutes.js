import express from 'express';

import { upload } from '../utils/cloudinary.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

import {
  signup,
  login,
  socialLogin,
  updateUser,
  updateFcmToken,
  getUserById,
  getUserStats,
  getUserList,
  sendOTP,
  verifyOTP,
} from '../controllers/authController.js';

const router = express.Router();

// Auth
router.post(
  '/signup',
  upload.single('profile'),
  signup
);

router.post('/login', login);

router.post('/social-login', socialLogin);

// OTP
router.post('/send-otp', sendOTP);

router.post('/verify-otp', verifyOTP);

// Protected User Routes
router.put(
  '/update/:id',
  authMiddleware,
  upload.single('profile'),
  updateUser
);

router.put(
  '/update-fcm/:id',
  authMiddleware,
  updateFcmToken
);

router.get(
  '/:id',
  authMiddleware,
  getUserById
);

// Admin/Protected Stats
router.get(
  '/user-stats',
  authMiddleware,
  getUserStats
);

router.get(
  '/users',
  authMiddleware,
  getUserList
);

export default router;