const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const Student = require('../models/student');
const { escapeRegex, normalizeEmail } = require('../utils/helpers');

const MIN_PASSWORD_LENGTH = 8;

// Turn Mongoose validation / duplicate-key errors into a friendly 400
const handleSaveError = (error, res, fallbackMessage) => {
  if (error.code === 11000) {
    return res.status(400).json({ success: false, message: 'Email or enrollment number is already registered' });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid or missing fields in the form' });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: fallbackMessage });
};

// Register (students only — role is never read from the request body)
const registerUser = async (req, res) => {
  try {
    const {
      email, password, fullName, mobileNumber, department,
      courseYear, marks10, marks12, enrollmentNumber, dateOfBirth
    } = req.body;

    if (!email || !password || !fullName || !enrollmentNumber || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, enrollment number and department are required'
      });
    }
    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const cleanEmail = normalizeEmail(email);

    // An admin with the same email would shadow this student at login
    const [existingStudent, existingAdmin, existingEnrollment] = await Promise.all([
      Student.findOne({ email: cleanEmail }),
      Admin.findOne({ email: new RegExp(`^${escapeRegex(cleanEmail)}$`, 'i') }),
      Student.findOne({ enrollmentNumber: String(enrollmentNumber).trim() }),
    ]);
    if (existingStudent || existingAdmin || existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Email or enrollment number is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Student({
      fullName,
      email: cleanEmail,
      password: hashedPassword,
      role: 'student',
      courseYear, marks10, marks12, enrollmentNumber, mobileNumber, department, dateOfBirth
    });
    await newUser.save();

    const userToReturn = newUser.toObject();
    delete userToReturn.password; // never send the hash back

    return res.status(201).json({ success: true, message: 'User registered successfully', user: userToReturn });
  } catch (error) {
    return handleSaveError(error, res, 'Registration failed');
  }
};

// Create an admin account. Only an existing admin can call this
// (route is protected by authMiddleware + requireAdmin).
const createAdmin = async (req, res) => {
  try {
    const { email, password, fullName, mobileNumber, department, designation } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const cleanEmail = normalizeEmail(email);
    const [existingAdmin, existingStudent] = await Promise.all([
      Admin.findOne({ email: new RegExp(`^${escapeRegex(cleanEmail)}$`, 'i') }),
      Student.findOne({ email: cleanEmail }),
    ]);
    if (existingAdmin || existingStudent) {
      return res.status(400).json({ success: false, message: 'This email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      email: cleanEmail,
      password: hashedPassword,
      role: 'admin',
      fullName, mobileNumber, department, designation
    });
    await newAdmin.save();

    const adminToReturn = newAdmin.toObject();
    delete adminToReturn.password;

    return res.status(201).json({ success: true, message: 'Admin created successfully', user: adminToReturn });
  } catch (error) {
    return handleSaveError(error, res, 'Admin creation failed');
  }
};

// Login (students and admins share one endpoint; the role comes from which collection matched)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = normalizeEmail(email);

    // Case-insensitive match so older admin records with mixed-case emails still work
    let user = await Admin.findOne({ email: new RegExp(`^${escapeRegex(cleanEmail)}$`, 'i') });
    let role = 'admin';

    if (!user) {
      user = await Student.findOne({ email: cleanEmail });
      role = 'student';
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (role === 'admin') {
      // updateOne avoids re-validating old admin documents
      await Admin.updateOne({ _id: user._id }, { lastLogin: new Date() });
    }

    const token = jwt.sign(
      { userid: user._id, email: user.email, role },
      process.env.JWT_SECRETE_KEY,
      { expiresIn: '15m' }
    );

    return res.status(200).json({ success: true, message: 'Logged in successfully', token, role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

module.exports = { registerUser, loginUser, createAdmin };
