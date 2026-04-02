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
    enum: ['Cervezas', 'Refrescos', 'Copas', 'Cafés', 'Vinos', 'Helados', 'Tapas', 'Otros'],
    required: true,
    default: 'Otros'
  },
  available: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0
  },
  isTracked: {
    type: Boolean,
    default: false
  },
  alertThreshold: {
    type: Number,
    default: 0
  }
})

export default mongoose.model('Product', productSchema) 