import Pooja from '../models/Pooja.js';


// create pooja
export const createPooja = async (req, res) => {
  try {
    const { name, description, price, enquiryBtn } = req.body;
    const image = req.file?.path || null;

    if (!name || !price) return res.status(400).json({ success: false, message: 'Name and price are required' });

    const formattedDescription = description ? description.replace(/\\n/g, '\n') : '';
    const pooja = await Pooja.create({ name, description: formattedDescription, price, image, enquiryBtn });
    return res.status(201).json({ success: true, message: 'Pooja created', data: pooja });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create pooja', error: error.message });
  }
};


// get all pooja
export const getAllPoojas = async (req, res) => {
  try {
    const poojas = await Pooja.find();
    return res.status(200).json({ success: true, message: 'Poojas fetched', data: poojas });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch poojas', error: error.message });
  }
};

// get pooja by id
export const getPoojaById = async (req, res) => {
  try {
    const pooja = await Pooja.findById(req.params.id);
    if (!pooja) return res.status(404).json({ message: 'Pooja not found' });
    return res.status(200).json({ data: pooja });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching pooja', error: error.message });
  }
};


// update pooja
export const updatePooja = async (req, res) => {
  try {
    const { name, description, price, enquiryBtn } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (price) updateData.price = price;
    if (enquiryBtn) updateData.enquiryBtn = enquiryBtn;
    if (description !== undefined) updateData.description = description.replace(/\\n/g, '\n');
    if (req.file) updateData.image = req.file.path;

    const updated = await Pooja.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Pooja not found' });
    return res.status(200).json({ success: true, message: 'Pooja updated', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update pooja', error: error.message });
  }
};


// delete pooja
export const deletePooja = async (req, res) => {
  try {
    await Pooja.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Pooja deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting pooja', error: error.message });
  }
};
