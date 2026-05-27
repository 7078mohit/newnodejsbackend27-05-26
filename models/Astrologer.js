import mongoose from 'mongoose';

const astrologerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    number: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    experience: { type: String, default: '' },
    skills: { type: [String], default: [] },
    profilePhoto: { type: String, default: null },

    eid: { type: String, default: null },
    password: { type: String, default: null },
    isSystemGeneratedPassword: { type: Boolean, default: true },
    loginToken: { type: String, default: null },
    fcmToken: { type: String, default: null },
    age: Number,
    gender: String,
    state: String,
    city: String,
    address: String,
    practice: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    about: { type: String, default: '' },
    salary: Number,
    perMinuteRate: Number,
    chatFee: { type: Number, default: 10 },
    callFee: { type: Number, default: 15 },
    videoFee: { type: Number, default: 20 },

    availability: {
      chat: { type: Boolean, default: false },
      call: { type: Boolean, default: false },
      videoCall: { type: Boolean, default: false },
    },
    available_at: {
      chat: { type: Boolean, default: false },
      call: { type: Boolean, default: false },
      videoCall: { type: Boolean, default: false },
    },

    status: {
      type: String,
      enum: ['live', 'offline'],
      default: 'offline',
    },
    agoraToken: { type: String, default: null },
    channelId: { type: String, default: null },
    uid: { type: Number, default: null },

    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isPremiumAstro: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Astrologer ||
  mongoose.model('Astrologer', astrologerSchema, 'astros');
