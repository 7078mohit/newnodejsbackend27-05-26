import express from 'express';

import { astrologerUploads } from '../utils/cloudinary.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

import {
  createAstrologer,
  getAllAstrologers,
  getAstrologer,
  updateAstrologer,
  deleteAstrologer,
  loginAstro,
  sendResetOtp,
  verifyOtpAndResetPassword,
  updateAstrologerAvailability,
} from '../controllers/astroController.js';

const router = express.Router();

// Create
router.post(
  '/create',
  astrologerUploads,
  createAstrologer
);

// Login
router.post('/login', loginAstro);

// Password Reset
router.post('/reset/send-otp', sendResetOtp);

router.post('/reset/verify', verifyOtpAndResetPassword);

// Public Routes
router.get('/get', getAllAstrologers);

router.get('/:id', getAstrologer);

// Protected Routes
router.put(
  '/update/:id',
  authMiddleware,
  astrologerUploads,
  updateAstrologer
);

router.patch(
  '/update-availability/:id',
  authMiddleware,
  updateAstrologerAvailability
);

router.delete(
  '/delete/:id',
  authMiddleware,
  deleteAstrologer
);

export default router;