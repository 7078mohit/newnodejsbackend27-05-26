import mongoose from 'mongoose';

const astroFormSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    number: { type: String, required: true, unique: true },
    skills: { type: [String], required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('AstroForm', astroFormSchema);
