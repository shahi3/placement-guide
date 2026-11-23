// One-time script to create the FIRST admin account.
//   ADMIN_EMAIL=you@college.edu ADMIN_PASSWORD='a-long-password' npm run seed:admin
// After that, log in at /admin-login. More admins can be created from the API
// (POST /admin/create-admin) by an existing admin.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/admin');
const { normalizeEmail } = require('../utils/helpers');

const run = async () => {
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME || 'Placement Admin';

  if (!email || !password || password.length < 8) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters) before running.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placementguide');

  if (await Admin.findOne({ email })) {
    console.log(`Admin ${email} already exists. Nothing to do.`);
  } else {
    await Admin.create({ email, password: await bcrypt.hash(password, 10), role: 'admin', fullName });
    console.log(`Admin ${email} created.`);
  }
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
