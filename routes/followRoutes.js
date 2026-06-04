import express from 'express';
import { followUnfollowAstrologer } from '../controllers/followController.js';

const router = express.Router();

// POST API
router.post("/astrologer-follow-unfollow", followUnfollowAstrologer);

export default router;
