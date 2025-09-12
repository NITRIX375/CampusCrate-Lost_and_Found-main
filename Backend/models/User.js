// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required:true, unique: true },
  googleId: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);