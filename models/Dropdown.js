import mongoose from 'mongoose';

const dropdownSchema = new mongoose.Schema({
  type: { type: String, required: true },
  value: { type: String, required: true },
});

export default mongoose.model('Dropdown', dropdownSchema);
