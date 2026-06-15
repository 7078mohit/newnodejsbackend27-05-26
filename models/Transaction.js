import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetail'
  },
  type: {
    type: String,
    enum: ['debit', 'credit']
  },
  amount: { type: Number },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Transaction', transactionSchema);
