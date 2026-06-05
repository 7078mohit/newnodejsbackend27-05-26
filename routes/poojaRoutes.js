import express from 'express';
import { upload } from '../utils/cloudinary.js';
import * as poojaController from '../controllers/poojaController.js';

const router = express.Router();


router.post('/create', upload.single('image'), poojaController.createPooja);
router.get('/get-all', poojaController.getAllPoojas);
router.get('/get-one/:id', poojaController.getPoojaById);
router.put('/update/:id', upload.single('image'), poojaController.updatePooja);
router.delete('/delete/:id', poojaController.deletePooja);

export default router;
