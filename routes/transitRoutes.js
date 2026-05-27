import express from 'express';
import { upload } from '../utils/cloudinary.js';
import { getTransits, getPlanetTransits } from '../controllers/transit.controller.js';
import {
  createTransit,
  getAllTransits,
  getTransitById,
  updateTransit,
  deleteTransit,
} from '../controllers/transitController.js';

const router = express.Router();

// App / public (static + planet transits from DB)
router.get('/get-trasnsit', getTransits);
router.get('/get-planet-transits', getPlanetTransits);

// Admin CRUD (Transit collection)
router.get('/admin-transits', getAllTransits);
router.post('/add-trasnsit', upload.single('image'), createTransit);
router.get('/update-trasnsit/:id', getTransitById);
router.patch('/update-trasnsit/:id', upload.single('image'), updateTransit);
router.delete('/delete-trasnsit/:id', deleteTransit);

export default router;
