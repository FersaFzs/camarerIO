import mongoose from 'mongoose'

const tableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  number: {
    type: Number,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Table', tableSchema) 