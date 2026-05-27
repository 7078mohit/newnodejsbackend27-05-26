import express from 'express';
import * as ratingReviewController from '../controllers/ratingReviewController.js';

const router = express.Router();

router.post("/rate-review", ratingReviewController.addOrUpdateReview);
router.get("/astrologer/:astrologerId", ratingReviewController.getAstrologerReviews);
router.delete("/:reviewId", ratingReviewController.deleteReview);

export default router;
