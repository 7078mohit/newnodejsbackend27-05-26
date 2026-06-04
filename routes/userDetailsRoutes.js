import express from 'express';

const router = express.Router();
import * as userController from '../controllers/userDetailsController.js';

// CREATE
router.post('/register', userController.createUser);

// READ
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
// router.get('/users/uid/:uid', userController.getUserByUid);

// UPDATE
router.put('/users/:id', userController.updateUser);
router.put('/users/:id/wallet', userController.updateWalletBalance);
router.put('/users/:id/follow', userController.toggleFollowAstrologer);
router.put('/users/:id/fcm-token', userController.updateFcmToken);
router.put('/users/:id/deactivate', userController.softDeleteUser);

// DELETE
router.delete('/users/:id', userController.deleteUser);

export default router;
