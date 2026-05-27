import express from 'express';
import * as faqController from '../controllers/faqController.js';

const router = express.Router();

router.get('/get-faqs', faqController.getAllFaqs);
router.get('/faqs/:id', faqController.getFaqById);
router.post('/add-faqs', faqController.createFaq);
router.put('/update-faqs/:id', faqController.updateFaq);
router.delete('/delete-faqs/:id', faqController.deleteFaq);

export default router;
