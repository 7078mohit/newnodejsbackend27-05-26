import mongoose from 'mongoose';

const planetTransitSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    color: { type: String, required: true },
  },
  { timestamps: true, collection: 'planetTransits' }
);

export default mongoose.model('PlanetTransit', planetTransitSchema);
