import mongoose from 'mongoose';

const transitSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model('Transit', transitSchema);
