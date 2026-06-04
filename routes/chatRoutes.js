import express from 'express';
import * as ChatController from '../controllers/chatController.js';

const router = express.Router();

router.post("/start", ChatController.startChat);
// User
router.get("/user/:id", ChatController.getUserById);

// Astrologer
router.get("/astrologer/:id", ChatController.getAstrologerById);



export default router;
