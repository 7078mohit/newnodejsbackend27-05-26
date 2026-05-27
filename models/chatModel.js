import mongoose from 'mongoose';

const chatLogSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserDetail',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Astrologer',
      required: true,
    },
    senderName: { type: String },
    senderProfilePic: { type: String },
    chatId: { type: String, required: true },
    time: { type: Date },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('ChatLog', chatLogSchema);
