import express from 'express';
import * as walletController from '../controllers/walletController.js';

const router = express.Router();

// Add money to wallet
router.post('/add', walletController.addMoney);
router.get('/get-all', walletController.getAllWallets);
// Get wallet by userId
router.get('/get/:userId', walletController.getWalletByUser);

router.get('/get-credit-summary/:userId', walletController.getCreditSummary);
router.post('/recharge-create-order', walletController.createRechargeOrder);
router.post('/recharge-verify', walletController.verifyRechargePayment);



export default router;
