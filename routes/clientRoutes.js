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

router.get('/:id', clientController.getClientById);

router.get('/loggedin/userdetails', 
  authMiddleware, 
  clientController.getLoggedInUserDetails);

router.put("/update/:id", upload.single("profile"), clientController.updateClientById);

// ✅ Delete client by ID
router.delete("/delete/:id", clientController.deleteClient);
export default router;
