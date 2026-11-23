require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const connectToDB = require('./database/db');

const authRoutes = require('./routes/Auth-routes');
const studentRoutes = require('./routes/Student-routes');
const adminRoutes = require('./routes/admin-routes');

// Fail fast: without a secret, every login would crash with a confusing error
if (!process.env.JWT_SECRETE_KEY) {
    console.error('Missing JWT_SECRETE_KEY in backend/.env (see .env.example)');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3008;
const CLIENT_URLS = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((u) => u.trim());

// Security headers. "cross-origin" lets the React app (another port) load uploaded images/PDFs.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: CLIENT_URLS, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '1mb' }));

// Only public files are served statically. Resumes (uploads/resume) are NOT here;
// they are served through authenticated routes instead.
app.use('/uploads/stories', express.static(path.join(__dirname, 'uploads', 'stories')));
app.use('/uploads/pdfs', express.static(path.join(__dirname, 'uploads', 'pdfs')));

app.get('/health', (req, res) => res.json({ success: true }));

app.use('/placementguide', authRoutes);
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Central error handler (upload errors, bad JSON, anything unexpected)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
        return res.status(400).json({ success: false, message });
    }
    if (err.status === 400 || err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: err.message });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start listening only after MongoDB is connected
// (skipped when this file is required by a test)
if (require.main === module) {
    connectToDB().then(() => {
        app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
    });
}

module.exports = app;
