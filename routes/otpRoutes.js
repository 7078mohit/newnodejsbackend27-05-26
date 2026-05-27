import express from 'express';
import * as otpController from '../controllers/otpController.js';

// routes/otpRoutes.js
const router = express.Router();

// Send OTP
router.post("/send-otp", otpController.sendOtp);

// Verify OTP
router.post("/verify-otp", otpController.verifyOtp);

export default router;
