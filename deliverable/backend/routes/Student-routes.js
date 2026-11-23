const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth-middleware');
const { uploadResume } = require('../middleware/upload');
const studentController = require('../controller/Student-controller');

router.get('/profile', auth, studentController.getStudentProfile);
router.post('/upload-resume', auth, uploadResume.single('resume'), studentController.uploadResume);
router.get('/resume', auth, studentController.getMyResume);
router.get('/applied-companies', auth, studentController.getAppliedCompanies);
router.get('/upcoming-companies', auth, studentController.getUpcomingCompanies);
router.post('/apply/:companyId', auth, studentController.applyToCompany);
router.get('/tests', auth, studentController.getMyTests);
router.get('/results', auth, studentController.getMyResults);
router.get('/view-alumni', auth, studentController.getAllAlumniStories);
router.get('/learningmaterial', auth, studentController.getLearningMaterial);

module.exports = router;
