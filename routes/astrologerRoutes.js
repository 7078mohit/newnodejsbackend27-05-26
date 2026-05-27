import express from 'express';
import * as astrologerController from '../controllers/astrologerController.js';
// import { getAstrologerStats, registerAstrologer } from '../controllers/astrologerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Auth
router.post(
    '/register',
    upload.single('profilePhoto'),
    astrologerController.registerAstrologer
);

router.post(
    '/login',
    astrologerController.loginAstrologer
);


// Protected Routes
router.patch(
    '/update-profile/:id',
    authMiddleware,
    upload.single('profilePhoto'),
    astrologerController.updateProfilePhoto
);

router.patch(
    '/update-availability/:id',
    authMiddleware,
    astrologerController.updateAvailability
);

router.patch(
    '/status/:id',
    authMiddleware,
    astrologerController.updateAvailabilityStatus
);

router.patch(
    '/approve/:id',
    authMiddleware,
    astrologerController.approveAstrologer
);

router.delete(
    '/delete/:id',
    authMiddleware,
    astrologerController.deleteAstrologer
);


// Public Routes
router.get('/all', astrologerController.getAllAstrologers);

router.get('/dropdowns', astrologerController.getDropdownOptions);

router.get('/astrologerbyId/:id', astrologerController.getAstrologerById);

router.get('/live', astrologerController.getLiveAstrologers);

router.get('/astrologer-stats', astrologerController.getAstrologerStats);


export default router;