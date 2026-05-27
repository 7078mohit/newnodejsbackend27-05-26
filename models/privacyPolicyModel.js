import mongoose from 'mongoose';

const privacyPolicySchema = new mongoose.Schema({
  content: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('PrivacyPolicy', privacyPolicySchema);
