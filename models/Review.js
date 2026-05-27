import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDetail', required: true },
    astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, astrologerId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
