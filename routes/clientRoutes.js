import express from 'express';
import * as clientController from '../controllers/clientController.js';
import { upload } from '../utils/cloudinary.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

// routes/clientRoutes.js
const router = express.Router();

// Signup route
router.post(
  "/signup",
  upload.single("profile"),
  clientController.signup
);

router.get('/user-details/get', authMiddleware, clientController.getUserDetails);
router.get('/:id', clientController.getClientById);

router.put("/update/:id", upload.single("profile"), clientController.updateClient);

// ✅ Delete client by ID
router.delete("/delete/:id", clientController.deleteClient);
export default router;
