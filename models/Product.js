import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    images: [{ type: String }],
    description: { type: String },
    price: { type: Number, required: true },
    oldPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
