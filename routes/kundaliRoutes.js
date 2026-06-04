import express from 'express';
import * as kundaliController from '../controllers/kundaliController.js';

const router = express.Router();

router.post('/add', kundaliController.createKundaliForm);
router.get('/getAll', kundaliController.getAllKundaliForms);
router.get('/get/:id', kundaliController.getKundaliFormById);
router.patch('/update/:id', kundaliController.updateKundaliForm);
router.delete('/delete/:id', kundaliController.deleteKundaliForm);

export default router;
