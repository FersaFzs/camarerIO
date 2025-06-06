import mongoose from 'mongoose'

const roundSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    }
  }],
  total: {
    type: Number,
    required: true,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Round', roundSchema) 