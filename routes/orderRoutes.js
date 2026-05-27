import express from 'express';
import { createOrder ,getOrder} from '../controllers/orderController.js';

// routes/orderRoutes.js
const router = express.Router();

router.post('/create-order', createOrder);

router.get('/order/:id',getOrder);

export default router;
