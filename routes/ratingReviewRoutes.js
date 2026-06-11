import express from 'express';
import * as ratingReviewController from '../controllers/ratingReviewController.js';

const router = express.Router();

router.post("/rate-review", ratingReviewController.addOrUpdateReview);
router.get("/get-astrologer/:astrologerId", ratingReviewController.getAstrologerReviews);
router.delete("/delete/:reviewId", ratingReviewController.deleteReview);

export default router;
