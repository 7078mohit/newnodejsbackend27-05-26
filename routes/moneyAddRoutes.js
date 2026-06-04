import express from 'express';
import { addMoney, getMoneyByUser, getMoneyOptions } from '../controllers/moneyAddController.js';

const router = express.Router();

// POST - Add Money prototype
router.post('/add', addMoney);

// GET - Get available money add options
router.get('/get-options', getMoneyOptions);

// GET - Get user money add history by userId
router.get('/user/:userId', getMoneyByUser);

export default router;
