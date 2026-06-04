import express from 'express';
import { createOrder, getOrderById, verifyPayment } from '../controllers/orderController.js';

// routes/orderRoutes.js
const router = express.Router();

router.post('/create', createOrder);

router.get('/get/:id',getOrderById);

router.post('/verify-payment', verifyPayment);

export default router;
