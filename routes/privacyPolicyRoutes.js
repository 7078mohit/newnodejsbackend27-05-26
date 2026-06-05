import express from 'express';

const router = express.Router();
import {
  getNewPrivacyPolicy,
  addPrivacyPolicy,
  updatePrivacyPolicy,
  deletePrivacyPolicy,
} from '../controllers/privacyPolicyController.js';


router.post('/add', addPrivacyPolicy);
router.get('/get-new', getNewPrivacyPolicy);
router.patch('/update/:id', updatePrivacyPolicy);
router.delete('/delete/:id', deletePrivacyPolicy);

export default router;
