import express from 'express';

import {
  generateAgoraToken,
  generateAgoraTokenFromBody,
} from '../controllers/agoraController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET Agora Token
router.get(
  '/rtc/:channelName/:role/:uid',
  authMiddleware,
  generateAgoraToken
);

// POST Agora Token
router.post(
  '/token',
  authMiddleware,
  generateAgoraTokenFromBody
);

export default router;