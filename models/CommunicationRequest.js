import mongoose from 'mongoose';

const communicationRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDetail', required: true },
    astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
    type: { type: String, enum: ['chat', 'call', 'videoCall'], required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('CommunicationRequest', communicationRequestSchema);
