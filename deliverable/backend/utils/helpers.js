const mongoose = require('mongoose');

// Escape user input before putting it inside a RegExp
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

module.exports = { escapeRegex, isValidId, normalizeEmail };
