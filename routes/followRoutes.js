import express from 'express';
import { followUnfollowAstrologer } from '../controllers/followController.js';

const router = express.Router();

// PATCH API
router.patch("/follow-astrologer", followUnfollowAstrologer);

export default router;
