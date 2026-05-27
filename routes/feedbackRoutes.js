import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';

const router = express.Router();

// Create feedback
router.post("/", feedbackController.createFeedback);

// Get all feedbacks
router.get("/", feedbackController.getAllFeedbacks);

// Get single feedback by ID
router.get("/:id", feedbackController.getFeedbackById);

// Update feedback
router.put("/:id", feedbackController.updateFeedback);

// Delete feedback
router.delete("/:id", feedbackController.deleteFeedback);

export default router;
