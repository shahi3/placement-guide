const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const { loginUser, registerUser } = require('../controller/Auth-controller');

// Slow down password guessing / signup spam
const limiter = (max) => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

router.post('/register', limiter(20), registerUser);
router.post('/login', limiter(30), loginUser);

module.exports = router;
