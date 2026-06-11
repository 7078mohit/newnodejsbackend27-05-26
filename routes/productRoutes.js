import express from 'express';
import { upload } from '../utils/cloudinary.js';
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.post('/create',
   upload.array('images', 10), 
   createProduct);
router.get('/get-all', getAllProducts);
router.put('/update/:id', upload.array('images', 10), updateProduct);
router.delete('/delete/:id', deleteProduct);

export default router;
