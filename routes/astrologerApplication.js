import express from 'express';
import { astrologerUploads } from '../utils/cloudinary.js';

import {
  createAstrologer,
  getAllAstrologers,
  updateAstrologer,
  deleteAstrologer,
  getAstrologer,
  loginAstrologer,
} from '../controllers/astrologerApplication.js';

const router = express.Router();

router.post(
  '/register',
  astrologerUploads,
  createAstrologer
);

router.post("/login", loginAstrologer);


router.get('/all', getAllAstrologers);

router.get('/single/:id', getAstrologer);

router.put(
  '/update/:id',
  astrologerUploads,
  updateAstrologer
);

router.delete('/delete/:id', deleteAstrologer);

export default router;