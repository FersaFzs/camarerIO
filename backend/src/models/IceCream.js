import mongoose from 'mongoose';

const iceCreamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});
 
export default mongoose.model('IceCream', iceCreamSchema); 