import mongoose from 'mongoose';

const notificationTokenSchema = new mongoose.Schema(
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
    fcmToken: {
      type: String,
      default: null
    },
    deviceType: {
      type: String,
      enum: ['android', 'ios', 'web'],
      default: 'android',
    },
  },
  { timestamps: true }
);

export default mongoose.model('NotificationToken', notificationTokenSchema);
