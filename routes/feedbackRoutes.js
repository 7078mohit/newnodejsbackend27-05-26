import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';

const router = express.Router();

// Create feedback
router.post("/create", feedbackController.createFeedback);

// Get all feedbacks
router.get("/getAll", feedbackController.getAllFeedbacks);

// Get single feedback by ID
router.get("/get/:id", feedbackController.getFeedbackById);

// Update feedback
router.put("/update/:id", feedbackController.updateFeedback);

// Delete feedback
router.delete("/delete/:id", feedbackController.deleteFeedback);

export default router;
