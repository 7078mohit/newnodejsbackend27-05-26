import KundaliForm from '../models/KundaliForm.js';

export const createKundaliForm = async (req, res) => {
  try {
    const form = await KundaliForm.create(req.body);
    return res.status(201).json({ message: 'Kundali form submitted', data: form });
  } catch (err) {
    return res.status(500).json({ message: 'Error submitting form', error: err.message });
  }
};

export const getAllKundaliForms = async (req, res) => {
  try {
    const forms = await KundaliForm.find();
    return res.status(200).json({ message: 'All Kundali forms fetched', data: forms });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching forms', error: err.message });
  }
};

export const getKundaliFormById = async (req, res) => {
  try {
    const form = await KundaliForm.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    return res.status(200).json({ message: 'Kundali form fetched', data: form });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching form', error: err.message });
  }
};

export const updateKundaliForm = async (req, res) => {
  try {
    const form = await KundaliForm.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    return res.status(200).json({ message: 'Kundali form updated', data: form });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating form', error: err.message });
  }
};

export const deleteKundaliForm = async (req, res) => {
  try {
    const form = await KundaliForm.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    return res.status(200).json({ message: 'Kundali form deleted', data: form });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting form', error: err.message });
  }
};
