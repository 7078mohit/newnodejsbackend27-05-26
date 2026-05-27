import express from 'express';
import { addContact } from '../controllers/contactController.js';

const router = express.Router();

router.post("/add", addContact);

export default router;
