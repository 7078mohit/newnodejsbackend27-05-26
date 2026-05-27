import mongoose from 'mongoose';

const poojaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
  price: { type: Number, required: true },
  enquiryBtn: { type: String },
});

export default mongoose.model('Pooja', poojaSchema);
