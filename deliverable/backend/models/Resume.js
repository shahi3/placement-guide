const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    filePath: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
