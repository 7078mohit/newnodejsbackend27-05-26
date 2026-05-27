import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const bannerSchema = new mongoose.Schema(
  {
    images: [
      {
        _id: { type: String, default: uuidv4 },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Banner', bannerSchema);
