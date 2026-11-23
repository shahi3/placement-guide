const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    courseYear: Number,
    marks10: Number,
    marks12: Number,
    // unique + sparse: no two students share an enrollment number, and old
    // documents without one don't collide with each other
    enrollmentNumber: { type: String, required: true, unique: true, sparse: true, trim: true },
    mobileNumber: String,
    department: { type: String, required: true, trim: true },
    dateOfBirth: Date
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
