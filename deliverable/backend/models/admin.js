const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  mobileNumber: String,
  fullName: String,
  profilePicture: String,
  department: String,
  designation: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { collection: 'admins', timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
