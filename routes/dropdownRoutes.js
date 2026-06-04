import express from 'express';
import * as dropdownCtrl from '../controllers/dropdownController.js';

const router = express.Router();

//Get All
router.get('/astro_skills', dropdownCtrl.getAllDropdownOptions);

// Add
router.post('/new-dropdowns', dropdownCtrl.addDropdownItem);

// Update
router.put('/update-dropdowns/:id', dropdownCtrl.updateDropdownItem);

// Delete
router.delete('/delete-dropdowns/:id', dropdownCtrl.deleteDropdownItem);

export default router;
