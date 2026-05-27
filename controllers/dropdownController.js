import Dropdown from '../models/Dropdown.js';

export const getDropdownOptions = async (req, res) => {
  try {
    const items = await Dropdown.find();
    const grouped = items.reduce((acc, curr) => {
      if (!acc[curr.type]) acc[curr.type] = [];
      acc[curr.type].push(curr.value);
      return acc;
    }, {});
    return res.status(200).json({ success: true, message: 'Dropdown options fetched', data: grouped });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addDropdownItem = async (req, res) => {
  try {
    const { type, value } = req.body;
    const existing = await Dropdown.findOne({ type, value });
    if (existing) return res.status(400).json({ message: 'Item already exists' });

    const newItem = await Dropdown.create({ type, value });
    return res.status(201).json({ message: 'Dropdown item added', data: newItem });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateDropdownItem = async (req, res) => {
  try {
    const updated = await Dropdown.findByIdAndUpdate(req.params.id, { value: req.body.value }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Dropdown item not found' });
    return res.status(200).json({ message: 'Dropdown item updated', data: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deleteDropdownItem = async (req, res) => {
  try {
    const deleted = await Dropdown.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Dropdown item not found' });
    return res.status(200).json({ message: 'Dropdown item deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
