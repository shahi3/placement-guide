const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/Auth-middleware');
const { requireAdmin } = require('../middleware/Auth-middleware');
const { uploadStoryImage, uploadPdf } = require('../middleware/upload');
const { createAdmin } = require('../controller/Auth-controller');
const {
  addCompany,
  uploadStory,
  addResult,
  getAllStories,
  getAllStudents,
  addStudentTest,
  getStudentsGroupedByDepartment,
  getCompaniesByDepartment,
  uploadLearningMaterial,
  getAllLearningMaterials,
  deleteLearningMaterial,
  getDashboardAnalytics,
  deleteStudent,
  getStudentResume,
} = require('../controller/Admin-controller');

// Every route below needs a valid ADMIN token
router.use(authMiddleware, requireAdmin);

router.post('/create-admin', createAdmin);

router.post('/add-company', addCompany);
router.post('/add-test', addStudentTest);
router.post('/add-result', addResult);
router.post('/upload-story', uploadStoryImage.single('image'), uploadStory);
router.get('/stories', getAllStories);
router.get('/grouped-students', getStudentsGroupedByDepartment);
router.get('/companies/:department', getCompaniesByDepartment);
router.get('/dashboard-analytics', getDashboardAnalytics);
router.get('/all-student', getAllStudents);
router.get('/students', getAllStudents);
router.delete('/students/:id', deleteStudent);
router.get('/resume/:studentId', getStudentResume);

router.post('/upload-learning-material', uploadPdf.single('pdf'), uploadLearningMaterial);
router.get('/learning-materials', getAllLearningMaterials);
router.delete('/delete-learning-material/:id', deleteLearningMaterial);

module.exports = router;
