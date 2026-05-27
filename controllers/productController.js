import Product from '../models/Product.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, oldPrice } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];

    if (!images.length) return res.status(400).json({ message: 'At least one image is required' });

    const newProduct = await Product.create({ name, images, description, price, oldPrice });
    return res.status(201).json({ message: 'Product added successfully', data: newProduct });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const productsWithDiscount = products.map((product) => {
      const discountPercent = product.oldPrice > 0
        ? ((product.oldPrice - product.price) / product.oldPrice * 100).toFixed(2)
        : 0;
      return { ...product._doc, discountPercent };
    });
    return res.status(200).json({ message: 'Products fetched', data: productsWithDiscount });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const updatedData = { name, description, price };
    if (req.files?.length > 0) updatedData.images = req.files.map((file) => file.path);

    const updated = await Product.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    return res.status(200).json({ message: 'Product updated', data: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    return res.status(200).json({ message: 'Product deleted', data: deleted });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};
