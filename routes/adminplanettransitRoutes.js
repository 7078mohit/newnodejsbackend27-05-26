import express from 'express';
import { upload } from '../utils/cloudinary.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

import {
    createTransit,
    getAllTransits,
    getTransitById,
    updateTransit,
    deleteTransit,
} from '../controllers/adminPlanetTransitController.js';

const router = express.Router();

// Admin CRUD APIs

// create 
router.post(
    '/create',
    upload.single('image'),
    authMiddleware,
    adminMiddleware,
    createTransit
);


// get all 
router.get('/get-all',
    getAllTransits);


// get one
router.get(
    '/get-one/:id',
    getTransitById
);

// update
router.patch(
    '/update/:id',
    upload.single('image'),
    authMiddleware,
    adminMiddleware,
    updateTransit
);

// delete
router.delete(
    '/delete/:id',
    authMiddleware,
    adminMiddleware,
    deleteTransit
);

export default router;