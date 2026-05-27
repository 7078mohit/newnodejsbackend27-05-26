import express from 'express';
import { astrologerUploads } from '../utils/cloudinary.js';

import {
  createAstrologer,
  getAllAstrologers,
  updateAstrologer,
  deleteAstrologer,
  getAstrologer,
} from '../controllers/astrologerApplication.js';

const router = express.Router();

router.post(
  '/register',
  astrologerUploads,
  createAstrologer
);

router.get('/all', getAllAstrologers);

router.get('/single/:id', getAstrologer);

router.put(
  '/update/:id',
  astrologerUploads,
  updateAstrologer
);

router.delete('/delete/:id', deleteAstrologer);

export default router;