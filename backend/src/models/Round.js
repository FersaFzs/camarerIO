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
    },
    combination: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    price: {
      type: Number,
      required: false
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
  },
  paidAt: {
    type: Date,
    default: null
  },
  isServiceConfirmed: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  }
})

export default mongoose.model('Round', roundSchema) 