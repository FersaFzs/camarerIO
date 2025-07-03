import mongoose from 'mongoose';

const liquorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

export default mongoose.model('Liquor', liquorSchema); 