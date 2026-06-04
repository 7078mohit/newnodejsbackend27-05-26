import Transit from '../models/AdminPlanetTransit.js';


// create api
export const createTransit = async (req, res) => {
  try {
    const { title, description, slug, color, image } = req.body;

    const imageUrl = req.file?.path || image;

    const transit = await Transit.create({
      title,
      description,
      slug,
      color,
      image: imageUrl,
    });

    return res.status(201).json({
      message: 'Transit created',
      data: transit,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};


// get all api
export const getAllTransits = async (req, res) => {
  try {
    const transits = await Transit.find();
    return res.status(200).json({ success: true, message: 'Transits fetched', data: transits });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};


// get by id
export const getTransitById = async (req, res) => {
  try {
    const transit = await Transit.findById(req.params.id);
    if (!transit) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ data: transit });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// update by id
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

// delete 
export const deleteTransit = async (req, res) => {
  try {
    await Transit.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Transit deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
