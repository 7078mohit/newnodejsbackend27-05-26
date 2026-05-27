import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res) => {
  try {
    const { userId, rating, review } = req.body;
    if (!userId || !rating || !review) return res.status(400).json({ success: false, message: 'All fields are required' });

    const feedback = await Feedback.create({ userId, rating, review });
    return res.status(201).json({ success: true, message: 'Feedback submitted', data: feedback });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating feedback', error: error.message });
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('userId', 'name profile').sort({ createdAt: -1 });
    const avgData = await Feedback.aggregate([{ $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }]);

    return res.status(200).json({
      success: true,
      message: 'Feedbacks fetched',
      data: {
        feedbacks,
        averageRating: avgData.length ? avgData[0].avgRating.toFixed(1) : '0.0',
        totalFeedbacks: avgData.length ? avgData[0].count : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching feedbacks', error: error.message });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate('userId', 'name profile');
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    return res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching feedback', error: error.message });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const updated = await Feedback.findByIdAndUpdate(req.params.id, { rating: req.body.rating, review: req.body.review }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Feedback not found' });
    return res.status(200).json({ success: true, message: 'Feedback updated', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating feedback', error: error.message });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Feedback not found' });
    return res.status(200).json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting feedback', error: error.message });
  }
};
