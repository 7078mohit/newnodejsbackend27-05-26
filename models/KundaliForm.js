import mongoose from 'mongoose';

const kundaliFormSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    location: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      cityOrVillage: { type: String, required: true },
      birthHour: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('KundaliForm', kundaliFormSchema);
