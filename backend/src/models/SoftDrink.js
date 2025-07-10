import mongoose from 'mongoose';

const softDrinkSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});
 
export default mongoose.model('SoftDrink', softDrinkSchema); 