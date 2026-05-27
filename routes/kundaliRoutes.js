import express from 'express';
import * as kundaliController from '../controllers/kundaliController.js';

const router = express.Router();

router.post('/add-kundali', kundaliController.createKundaliForm);
router.get('/get-kundali', kundaliController.getAllKundaliForms);
router.get('/get-kundalbyID/:id', kundaliController.getKundaliFormById);
router.patch('/update-kundali/:id', kundaliController.updateKundaliForm);
router.delete('/delete-kundali/:id', kundaliController.deleteKundaliForm);

export default router;
