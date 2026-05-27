import express from 'express';
import * as dropdownCtrl from '../controllers/dropdownController.js';

const router = express.Router();

router.get('/astro_skills', dropdownCtrl.getDropdownOptions);
router.post('/new-dropdowns', dropdownCtrl.addDropdownItem);
router.put('/update-dropdowns/:id', dropdownCtrl.updateDropdownItem);
router.delete('/delete-dropdowns/:id', dropdownCtrl.deleteDropdownItem);

export default router;
