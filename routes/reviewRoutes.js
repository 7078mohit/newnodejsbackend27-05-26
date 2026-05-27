import express from 'express';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

// Create Review
router.post("/", reviewController.createReview);

// Get Reviews by Astrologer + Avg rating
router.get("/:astrologerId", reviewController.getReviewsByAstrologer);

// Update Review
router.put("/:reviewId", reviewController.updateReview);

// Delete Review
router.delete("/:reviewId", reviewController.deleteReview);

export default router;
