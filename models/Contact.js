import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    mobile: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'],
    },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dob_time: { type: String, required: true },
    place_of_birth: { type: String, required: true },
    query: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

export default mongoose.model('Contact', contactSchema);
