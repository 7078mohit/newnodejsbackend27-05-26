import mongoose from 'mongoose';

const AstrologerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    speciality: { type: String, required: true },
    salary: { type: Number, required: true },
    experience: { type: String, required: true },
    availability: {
      chat: { type: Boolean, default: false },
      voice: { type: Boolean, default: false },
      video: { type: Boolean, default: false },
    },
    profilePhoto: { type: String },
    bankDocument: { type: String },
    adharCard: { type: String },
    panCard: { type: String },
    phoneNumber: { type: String, required: true },
    alternateNumber: { type: String },
    email: { type: String, required: true, unique: true },
    eid: { type: String, unique: true },
    password: { type: String },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.AstrologerHR ||
  mongoose.model('AstrologerHR', AstrologerSchema, 'astrologers');
