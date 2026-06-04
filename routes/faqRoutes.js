import express from 'express';
import * as faqController from '../controllers/faqController.js';

const router = express.Router();

router.get('/getAll', faqController.getAllFaqs);

router.get('/get/:id', faqController.getFaqById);

router.post('/add', faqController.createFaq);

router.put('/update/:id', faqController.updateFaq);

router.delete('/delete/:id', faqController.deleteFaq);

export default router;
