import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userType',
      required: true,
    },
    userType: {
      type: String,
      enum: ['UserDetail', 'Astrologer'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['voice', 'video', 'stream', 'general'],
      default: 'general',
    },
    fcmToken: { type: String, default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
