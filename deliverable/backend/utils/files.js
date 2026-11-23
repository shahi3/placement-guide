const path = require('path');
const fs = require('fs');
const { DIRS } = require('../middleware/upload');

// Old records may hold Windows-style or relative paths; only the file name matters.
const baseOf = (p) => path.basename(String(p).replace(/\\/g, '/'));

const resumePath = (filePath) => path.join(DIRS.resume, baseOf(filePath));
const pdfPath = (pdfUrl) => path.join(DIRS.pdfs, baseOf(pdfUrl));

// Resumes are private: only called from routes that already checked who is asking.
const sendResumeFile = (res, resume) => {
  const fullPath = resumePath(resume.filePath);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ success: false, message: 'Resume file not found' });
  }
  return res.sendFile(fullPath);
};

module.exports = { resumePath, pdfPath, sendResumeFile };
