import express from 'express';
import {
    createAstroForm,
    verifyOtp
} from '../controllers/AstroFormController.js';

const router = express.Router();

router.post('/create', createAstroForm);

router.post('/verify-otp', verifyOtp);

export default router;