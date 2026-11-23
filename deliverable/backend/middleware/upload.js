const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Absolute paths so uploads work no matter where `node` is started from
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const DIRS = {
  resume: path.join(UPLOAD_ROOT, 'resume'),
  stories: path.join(UPLOAD_ROOT, 'stories'),
  pdfs: path.join(UPLOAD_ROOT, 'pdfs'),
};
Object.values(DIRS).forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

const safeName = (name) => path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');

const rejectFile = (message) => {
  const err = new Error(message);
  err.status = 400;
  return err;
};

const makeUploader = ({ dir, allowed, maxMB, filename }) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, dir),
      filename: (req, file, cb) => cb(null, filename(file)),
    }),
    limits: { fileSize: maxMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ok = Array.isArray(allowed) ? allowed.includes(file.mimetype) : file.mimetype in allowed;
      cb(ok ? null : rejectFile('Invalid file type'), ok);
    },
  });

// Resumes: PDF / DOC / DOCX, max 5 MB. Random names => not guessable.
const RESUME_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};
const uploadResume = makeUploader({
  dir: DIRS.resume,
  allowed: RESUME_TYPES,
  maxMB: 5,
  filename: (file) => `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${RESUME_TYPES[file.mimetype]}`,
});

// Alumni story images: max 5 MB
const uploadStoryImage = makeUploader({
  dir: DIRS.stories,
  allowed: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxMB: 5,
  filename: (file) => `${Date.now()}-${safeName(file.originalname)}`,
});

// Learning material: PDF only, max 20 MB
const uploadPdf = makeUploader({
  dir: DIRS.pdfs,
  allowed: ['application/pdf'],
  maxMB: 20,
  filename: (file) => `${Date.now()}-${safeName(file.originalname)}`,
});

// Delete a stored file, ignoring "already gone"
const removeFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
};

module.exports = { uploadResume, uploadStoryImage, uploadPdf, removeFile, DIRS };
