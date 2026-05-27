import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserDetail',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Astrologer',
      required: true,
    },
    callType: {
      type: String,
      enum: ['chat', 'voice', 'video', 'live'],
      required: true,
    },
    channelName: { type: String, required: true },
    status: {
      type: String,
      enum: ['ringing', 'accepted', 'rejected', 'missed', 'ended'],
      default: 'ringing',
    },
    duration: { type: Number, default: 0 },
    ratePerMinute: { type: Number, default: 0 },
    totalEarning: { type: Number, default: 0 },
    endTime: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('CallLog', callLogSchema);
