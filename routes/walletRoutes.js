import express from 'express';
import * as walletController from '../controllers/walletController.js';

const router = express.Router();

// Add money to wallet
router.post('/add', walletController.addMoney);
router.post('/recharge/create-order', walletController.createRechargeOrder);
router.post('/recharge/verify', walletController.verifyRechargePayment);
router.get('/summary/:userId', walletController.getCreditSummary);
router.get('/all', walletController.getAllWallets);

// Get wallet by userId
router.get('/:userId', walletController.getWalletByUser);

export default router;
