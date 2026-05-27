import mongoose from 'mongoose';
import Review from '../models/Review.js';

export const createReview = async (req, res) => {
  try {
    const { userId, astrologerId, rating, review } = req.body;
    const newReview = await Review.create({ userId, astrologerId, rating, review });
    return res.status(201).json({ message: 'Review added successfully', review: newReview });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'You already reviewed this astrologer' });
    return res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

export const getReviewsByAstrologer = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    const reviews = await Review.find({ astrologerId }).populate('userId', 'name profile').sort({ createdAt: -1 });
    const average = await Review.aggregate([
      { $match: { astrologerId: new mongoose.Types.ObjectId(astrologerId) } },
      { $group: { _id: '$astrologerId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    return res.status(200).json({
      message: 'Reviews fetched',
      reviews,
      averageRating: average.length ? average[0].avgRating.toFixed(1) : 0,
      totalReviews: average.length ? average[0].count : 0,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(req.params.reviewId, { rating: req.body.rating, review: req.body.review }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Review not found' });
    return res.status(200).json({ message: 'Review updated', review: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.reviewId);
    if (!deleted) return res.status(404).json({ message: 'Review not found' });
    return res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};
