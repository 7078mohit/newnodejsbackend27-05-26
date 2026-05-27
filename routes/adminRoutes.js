import express from 'express';
import { registerAdmin, loginAdmin } from '../controllers/adminController.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

router.post(
    '/register',
    upload.single('profile'),
    registerAdmin
);

router.post('/login', loginAdmin);

export default router;