import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['Cervezas', 'Refrescos', 'Copas', 'Cafés', 'Otros'],
    required: true,
    default: 'Otros'
  },
  available: {
    type: Boolean,
    default: true
  }
})

export default mongoose.model('Product', productSchema) 