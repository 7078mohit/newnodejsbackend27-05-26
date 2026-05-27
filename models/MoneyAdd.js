import mongoose from 'mongoose';

const moneyAddSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserDetail',
      required: true,
    },
    selectedAmount: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('MoneyAdd', moneyAddSchema, 'MoneyAdd');
