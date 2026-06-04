import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserDetail',
      required: true,
    },

    sessionId: {
      type: String,
      required: true,
    },

    razorpayOrderId: {
      type: String,
    },

    // Payment Success ke baad save hoga
    razorpayPaymentId: {
      type: String,
    },

    // Payment Verification Signature
    razorpaySignature: {
      type: String,
    },

    amount: {
      type: Number,
    },

    customProductId: {
      type: String,
      unique: true,
    },

    status: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'CONFIRMED', 'FAILED'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Order', orderSchema);