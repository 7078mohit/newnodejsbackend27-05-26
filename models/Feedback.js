import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserDetail',
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, maxlength: 500, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
