import express from 'express';

const router = express.Router();
import {
  getPrivacyPolicy,
  addPrivacyPolicy,
  updatePrivacyPolicy,
  deletePrivacyPolicy,
} from '../controllers/privacyPolicyController.js';

router.get('/get-privacy-policy', getPrivacyPolicy);
router.post('/add-privacy-policy', addPrivacyPolicy);
router.patch('/update-privacy-policy/:id', updatePrivacyPolicy);
router.delete('/delete-privacy-policy/:id', deletePrivacyPolicy);

export default router;
