import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import UserDetail from '../models/UserDetail.js';

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

export const createOrder = async (req, res) => {
  try {
    const { productId, userId, amount, sessionId } = req.body;

    if (!productId || !userId || !amount || !sessionId) {
      return res.status(400).json({ message: 'Product ID, user ID, amount, and sessionId are required' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Razorpay keys are not configured' });
    }

    const [product, user] = await Promise.all([Product.findById(productId), UserDetail.findById(userId)]);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    const customProductId = `CPID_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const order = new Order({ product: productId, user: userId, sessionId, razorpayOrderId: razorpayOrder.id, amount, status: 'PENDING', customProductId });
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('product', 'name price description images')
      .populate('user', 'name email mobileNo');

    return res.status(201).json({ message: 'Order created successfully', data: populatedOrder, razorpayOrderId: razorpayOrder.id });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let order = await Order.findById(id).populate('product', 'name price description images').populate('user', 'name email mobileNo');
    if (!order) {
      order = await Order.findOne({ razorpayOrderId: id }).populate('product', 'name price description images').populate('user', 'name email mobileNo');
    }
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json({ message: 'Order fetched successfully', data: order });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};
