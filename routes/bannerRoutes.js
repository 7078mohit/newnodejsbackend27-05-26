import express from 'express';

import { upload } from '../utils/cloudinary.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

import {
    addBanners,
    getBanners,
    deleteBanners
} from '../controllers/bannerController.js';

const router = express.Router();

// Public
router.get('/get-banner', getBanners);

// Protected
router.post(
    '/add-banner',
    authMiddleware,
    upload.array('images'),
    addBanners
);

router.delete(
    '/banners/:id',
    authMiddleware,
    deleteBanners
);

export default router;