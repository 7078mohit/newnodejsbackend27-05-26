import PrivacyPolicy from '../models/privacyPolicyModel.js';


// create privacy policy
export const addPrivacyPolicy = async (req, res) => {
  try {
    const newPolicy = await PrivacyPolicy.create({ content: req.body.content });
    return res.status(201).json(newPolicy);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create policy' });
  }
};


// get first and new privacy policy
export const getNewPrivacyPolicy = async (req, res) => {
  try {
    const policy = await PrivacyPolicy.findOne().sort({ updatedAt: -1 });
    if (!policy) return res.status(404).json({ message: 'Privacy Policy not found' });
    return res.status(200).json(policy);
  } catch (err) {
    return res.status(500).json({ message: 'Server Error' });
  }
};


// update privacy policy
export const updatePrivacyPolicy = async (req, res) => {
  try {
    const updated = await PrivacyPolicy.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content, updatedAt: Date.now() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Policy not found' });
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update policy' });
  }
};


// delete privacy policy
export const deletePrivacyPolicy = async (req, res) => {
  try {
    const deleted = await PrivacyPolicy.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Policy not found' });
    return res.status(200).json({ message: 'Policy deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete policy' });
  }
};
