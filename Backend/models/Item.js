// backend/models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  photoUrl: { type: String },
  status: {
    type: String,
    enum: ['active', 'claimed', 'returned'],
    default: 'active',
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  claimQuestion: { type: String }, // A question only the owner can answer
  tags: [String],
  isApproved: { // For admin approval
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Create a text index for searching
itemSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' });

module.exports = mongoose.model('Item', itemSchema);