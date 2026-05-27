import mongoose from 'mongoose';

const followAstrologerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserDetail',
      required: true,
    },
    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Astrologer',
      required: true,
    },
    isFollowed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.FollowAstrologer ||
  mongoose.model('FollowAstrologer', followAstrologerSchema);
