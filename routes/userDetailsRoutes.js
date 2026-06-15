import express from 'express';

const router = express.Router();
import * as userController from '../controllers/userDetailsController.js';

// CREATE
router.post('/register', userController.createUser);

// READ
router.get('/get-all', userController.getAllUsers);
router.get('/get/:id', userController.getUserById);
router.get('/get/uid/:uid', userController.getUserByUid);

// UPDATE
router.put('/update/:id', userController.updateUser);
router.put('/update-wallet/:id', userController.updateWalletBalance);
router.put('/follow-unfollow-astro/:id', userController.toggleFollowAstrologer);
router.put('/update-fcm-token/:id', userController.updateFcmToken);
router.put('/users-deactivate/:id', userController.softDeleteUser);

// DELETE
router.delete('/delete/:id', userController.deleteUser);

export default router;
