import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    number: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    profile: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Admin', adminSchema);
