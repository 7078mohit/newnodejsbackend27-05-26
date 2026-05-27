import Transit from '../models/Transit.js';

export const createTransit = async (req, res) => {
  try {
    const { title, description, slug } = req.body;
    const image = req.file?.path;
    const transit = await Transit.create({ title, description, slug, image });
    return res.status(201).json({ message: 'Transit created', data: transit });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllTransits = async (req, res) => {
  try {
    const transits = await Transit.find();
    return res.status(200).json({ success: true, message: 'Transits fetched', data: transits });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

export const getTransitById = async (req, res) => {
  try {
    const transit = await Transit.findById(req.params.id);
    if (!transit) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ data: transit });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateTransit = async (req, res) => {
  try {
    const { title, description, slug } = req.body;
    const updatedData = { title, description, slug };
    if (req.file) updatedData.image = req.file.path;

    const transit = await Transit.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    return res.status(200).json({ message: 'Transit updated', data: transit });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteTransit = async (req, res) => {
  try {
    await Transit.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Transit deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
