import express from 'express';
import { upload } from '../utils/cloudinary.js';
import * as poojaController from '../controllers/poojaController.js';

const router = express.Router();


router.post('/add-poojas', upload.single('image'), poojaController.createPooja);
router.get('/All-poojas', poojaController.getAllPoojas);
router.put('/update/:id', upload.single('image'), poojaController.updatePooja);
router.get('/poojas/:id', poojaController.getPoojaById);
router.delete('/delete-pooja/:id', poojaController.deletePooja);

export default router;
