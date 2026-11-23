const Company = require('../models/Company');
const Test = require('../models/Test');
const Result = require('../models/Result');
const Resume = require('../models/Resume');
const AlumniStory = require('../models/AlumniStory');
const Student = require('../models/student');
const Admin = require('../models/admin');
const LearningMaterial = require('../models/LearningMaterial');
const { removeFile } = require('../middleware/upload');
const { pdfPath, resumePath, sendResumeFile } = require('../utils/files');
const { escapeRegex, isValidId } = require('../utils/helpers');

const isValidDate = (value) => value && !Number.isNaN(new Date(value).getTime());
const isHttpUrl = (value) => /^https?:\/\/\S+$/i.test(String(value || ''));

// Find the company a result/test refers to.
// Preferred: companyId. Fallback: company name (case-insensitive). The same
// name can exist for several departments, so we prefer the student's department.
const resolveCompany = async ({ companyId, companyName, student }) => {
  if (companyId) {
    return isValidId(companyId) ? Company.findById(companyId) : null;
  }
  if (!companyName) return null;

  const nameRegex = new RegExp(`^${escapeRegex(String(companyName).trim())}$`, 'i');
  const inDepartment = await Company.findOne({ name: nameRegex, department: student.department });
  if (inDepartment) return inDepartment;

  const matches = await Company.find({ name: nameRegex }).limit(2);
  return matches.length === 1 ? matches[0] : null;
};

// ---------- Learning material ----------
const getAllLearningMaterials = async (req, res) => {
  try {
    const materials = await LearningMaterial.find().sort({ uploadedAt: -1 });
    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    console.error('Error fetching learning materials:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const uploadLearningMaterial = async (req, res) => {
  try {
    const subject = String(req.body.subject || '').trim();
    if (!subject || !req.file) {
      removeFile(req.file?.path);
      return res.status(400).json({ success: false, message: 'Subject and PDF are required.' });
    }

    const material = await new LearningMaterial({
      subject,
      pdfUrl: `/uploads/pdfs/${req.file.filename}`,
    }).save();

    res.status(201).json({ success: true, message: 'Learning material uploaded successfully!', data: material });
  } catch (error) {
    console.error('Error uploading learning material:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const deleteLearningMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const material = await LearningMaterial.findByIdAndDelete(id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Learning material not found' });
    }
    removeFile(pdfPath(material.pdfUrl));
    res.status(200).json({ success: true, message: 'Learning material deleted successfully!' });
  } catch (error) {
    console.error('Error deleting learning material:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ---------- Results ----------
const addResult = async (req, res) => {
  try {
    const { enrollmentNumber, companyName, companyId, result, clearedRound } = req.body;

    if (!enrollmentNumber || !(companyName || companyId) || !result || !clearedRound) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!['pass', 'fail'].includes(result)) {
      return res.status(400).json({ success: false, message: "Result must be 'pass' or 'fail'" });
    }

    const student = await Student.findOne({ enrollmentNumber: String(enrollmentNumber).trim() });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const company = await resolveCompany({ companyId, companyName, student });
    if (!company) {
      return res.status(404).json({ success: false, message: "No matching company found for this student's department" });
    }

    const newResult = await new Result({
      studentId: student._id,
      companyId: company._id,
      result,
      clearedRound,
    }).save();

    res.status(201).json({ success: true, message: 'Result added successfully', result: newResult });
  } catch (error) {
    console.error('Error adding result:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ---------- Companies ----------
const addCompany = async (req, res) => {
  try {
    const { name, eligibility, description, department, applicationDeadline, googleFormLink } = req.body;

    if (!name || !eligibility || !department || !applicationDeadline || !googleFormLink) {
      return res.status(400).json({ success: false, message: 'Name, eligibility, department, deadline and form link are required' });
    }
    if (!isValidDate(applicationDeadline)) {
      return res.status(400).json({ success: false, message: 'Invalid application deadline' });
    }
    if (!isHttpUrl(googleFormLink)) {
      return res.status(400).json({ success: false, message: 'Form link must start with http:// or https://' });
    }

    const adminId = req.user.userid;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const company = await new Company({
      name: String(name).trim(),
      eligibility,
      description,
      department: String(department).trim(),
      applicationDeadline,
      googleFormLink,
      createdBy: adminId,
    }).save();

    res.status(201).json({ success: true, message: 'Company added successfully', company });
  } catch (error) {
    console.error('Error in addCompany:', error);
    res.status(500).json({ success: false, message: 'Failed to add company' });
  }
};

const getCompaniesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const companies = await Company.find({ department })
      .select('name eligibility description applicationDeadline googleFormLink');
    res.status(200).json({ success: true, companies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch companies' });
  }
};

// ---------- Alumni stories ----------
const uploadStory = async (req, res) => {
  try {
    const { name, story, year } = req.body;
    if (!name || !story || !year) {
      removeFile(req.file?.path);
      return res.status(400).json({ success: false, message: 'Name, story, and year are required' });
    }

    const newStory = await new AlumniStory({
      name, story, year,
      image: req.file ? req.file.filename : null,
    }).save();

    res.status(201).json({ success: true, message: 'Story uploaded successfully', data: newStory });
  } catch (error) {
    console.error('Error uploading story:', error);
    res.status(500).json({ success: false, message: 'Story upload failed' });
  }
};

const getAllStories = async (req, res) => {
  try {
    const stories = await AlumniStory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stories' });
  }
};

// ---------- Students ----------
const getStudentsGroupedByDepartment = async (req, res) => {
  try {
    const grouped = await Student.aggregate([
      { $project: { password: 0 } }, // aggregates ignore .select(), so strip hashes here
      { $group: { _id: '$department', students: { $push: '$$ROOT' } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json({ success: true, data: grouped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch grouped students' });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const filter = { role: 'student' };
    if (req.query.department) filter.department = req.query.department;

    const students = await Student.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete a student and everything that belongs to them
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const resume = await Resume.findOne({ studentId: id });
    await Promise.all([
      Test.deleteMany({ studentId: id }),
      Result.deleteMany({ studentId: id }),
      Resume.deleteMany({ studentId: id }),
      Company.updateMany({ appliedStudents: id }, { $pull: { appliedStudents: id } }),
    ]);
    if (resume) removeFile(resumePath(resume.filePath));

    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin views a student's resume
const getStudentResume = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }
    const resume = await Resume.findOne({ studentId });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume uploaded' });
    }
    return sendResumeFile(res, resume);
  } catch (error) {
    console.error('Error fetching resume:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ---------- Tests ----------
const addStudentTest = async (req, res) => {
  try {
    const { enrollmentNumber, companyName, companyId, date, description, testLink, location } = req.body;

    if (!enrollmentNumber || !(companyName || companyId) || !date || !testLink || !location) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!isValidDate(date)) {
      return res.status(400).json({ success: false, message: 'Invalid test date' });
    }

    const admin = await Admin.findById(req.user.userid);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const student = await Student.findOne({ enrollmentNumber: String(enrollmentNumber).trim() });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const company = await resolveCompany({ companyId, companyName, student });
    if (!company) {
      return res.status(404).json({ success: false, message: "No matching company found for this student's department" });
    }

    const newTest = await new Test({
      studentId: student._id,
      enrollmentNumber: student.enrollmentNumber,
      companyId: company._id,
      companyName: company.name,
      date,
      description,
      testLink,
      location,
    }).save();

    res.status(201).json({ success: true, message: 'Test assigned successfully', data: newTest });
  } catch (error) {
    console.error('Error assigning test:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ---------- Analytics ----------
const getDashboardAnalytics = async (req, res) => {
  try {
    const [students, companies, results, tests] = await Promise.all([
      Student.countDocuments(),
      Company.countDocuments(),
      Result.countDocuments(),
      Test.countDocuments(),
    ]);
    res.status(200).json({ success: true, data: { students, companies, results, tests } });
  } catch (error) {
    console.error('Error fetching analytics data:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  addCompany,
  addStudentTest,
  getAllStudents,
  deleteStudent,
  getStudentResume,
  uploadStory,
  getAllStories,
  addResult,
  getCompaniesByDepartment,
  getStudentsGroupedByDepartment,
  uploadLearningMaterial,
  getAllLearningMaterials,
  deleteLearningMaterial,
  getDashboardAnalytics,
};
