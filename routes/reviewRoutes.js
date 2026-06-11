import express from 'express';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

// Create Review
router.post("/create", reviewController.createReview);

// Get Reviews by Astrologer + Avg rating
router.get("/get/:astrologerId", reviewController.getReviewsByAstrologer);

// Update Review
router.put("/update/:reviewId", reviewController.updateReview);

// Delete Review
router.delete("/delete/:reviewId", reviewController.deleteReview);

export default router;
