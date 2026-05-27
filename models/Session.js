import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    communicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunicationRequest' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDetail' },
    astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer' },
    type: { type: String, enum: ['chat', 'call', 'videoCall'] },
    startedAt: { type: Date, default: Date.now },
    lastChargedAt: { type: Date, default: null },
    endedAt: Date,
    totalDuration: Number,
    totalCharged: { type: Number, default: 0 },
    ratePerSecond: Number,
    status: {
      type: String,
      enum: ['active', 'completed', 'terminated'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
