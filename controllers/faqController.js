import Faq from '../models/Faq.js';

export const getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find();
    return res.json(faqs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    return res.json(faq);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faq = await Faq.create({ question, answer });
    return res.status(201).json(faq);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    return res.json(faq);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    return res.json({ message: 'FAQ deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
