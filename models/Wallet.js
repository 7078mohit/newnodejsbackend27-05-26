import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserDetail',
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0 },
    transactions: [
      {
        type: { type: String, enum: ['credit', 'debit'], required: true },
        amount: { type: Number, required: true },
        reason: { type: String },
        paymentId: { type: String, default: null },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Wallet', walletSchema);
