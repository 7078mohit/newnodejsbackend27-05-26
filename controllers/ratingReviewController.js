import mongoose from 'mongoose';
import RatingReview from '../models/RatingReview.js';
import Astrologer from '../models/Astrologer.js';

export const addOrUpdateReview = async (req, res) => {
  try {
    const { userId, astrologerId, rating, review } = req.body;

    if (!mongoose.Types.ObjectId.isValid(astrologerId)) {
      return res.status(400).json({ success: false, message: 'Invalid astrologerId' });
    }

    const existing = await RatingReview.findOne({ user: userId, astrologer: astrologerId });
    if (existing) {
      existing.rating = rating;
      existing.review = review;
      await existing.save();
    } else {
      await RatingReview.create({ user: userId, astrologer: astrologerId, rating, review });
    }

    const stats = await RatingReview.aggregate([
      { $match: { astrologer: new mongoose.Types.ObjectId(astrologerId) } },
      { $group: { _id: '$astrologer', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
    ]);

    await Astrologer.findByIdAndUpdate(astrologerId, {
      averageRating: stats[0]?.avgRating || 0,
      totalReviews: stats[0]?.totalReviews || 0,
    });

    return res.status(200).json({ success: true, message: 'Rating & review saved' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAstrologerReviews = async (req, res) => {
  try {
    const reviews = await RatingReview.find({ astrologer: req.params.astrologerId })
      .populate('user', 'name profile')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, total: reviews.length, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    await RatingReview.findByIdAndDelete(req.params.reviewId);
    return res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
