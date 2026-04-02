import mongoose from 'mongoose';

const softDrinkSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  stock: { type: Number, default: 0 },
  isTracked: { type: Boolean, default: false },
  alertThreshold: { type: Number, default: 0 }
});
 
export default mongoose.model('SoftDrink', softDrinkSchema); 