const User = require('../models/student');
const Company = require('../models/Company');
const Resume = require('../models/Resume');
const Test = require('../models/Test');
const Result = require('../models/Result');
const AlumniStory = require('../models/AlumniStory');
const LearningMaterial = require('../models/LearningMaterial');
const { removeFile } = require('../middleware/upload');
const { sendResumeFile } = require('../utils/files');
const { isValidId } = require('../utils/helpers');

// Get the logged-in student's profile
const getStudentProfile = async (req, res) => {
    try {
        const student = await User.findById(req.user.userid).select('-password');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, data: student });
    } catch (err) {
        console.error('Error fetching profile:', err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Upload resume (file type and size are checked by the multer filter)
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const existingResume = await Resume.findOne({ studentId: req.user.userid });
        if (existingResume) {
            removeFile(req.file.path); // don't leave an orphan file behind
            return res.status(409).json({ success: false, message: 'Resume already uploaded' });
        }

        const resume = new Resume({
            studentId: req.user.userid,
            filePath: `uploads/resume/${req.file.filename}`,
        });
        await resume.save();
        res.status(201).json({ success: true, message: 'Resume uploaded successfully' });
    } catch (err) {
        console.error('Resume upload error:', err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Download my own resume
const getMyResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({ studentId: req.user.userid });
        if (!resume) {
            return res.status(404).json({ success: false, message: 'No resume uploaded' });
        }
        return sendResumeFile(res, resume);
    } catch (err) {
        console.error('Error fetching resume:', err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Companies I marked as applied
const getAppliedCompanies = async (req, res) => {
    try {
        const companies = await Company.find({ appliedStudents: req.user.userid })
            .select('name department description applicationDeadline googleFormLink');
        res.status(200).json({ success: true, companies });
    } catch (err) {
        console.error('Error fetching applied companies:', err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Mark a company as applied
const applyToCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        if (!isValidId(companyId)) {
            return res.status(400).json({ success: false, message: 'Invalid company ID' });
        }

        const [student, company] = await Promise.all([
            User.findById(req.user.userid).select('department'),
            Company.findById(companyId),
        ]);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        if (company.department !== student.department) {
            return res.status(403).json({ success: false, message: 'This company is not open to your department' });
        }
        if (company.applicationDeadline < new Date()) {
            return res.status(400).json({ success: false, message: 'The application deadline has passed' });
        }

        // Atomic: adds the student only if they are not already in the list
        const update = await Company.updateOne(
            { _id: companyId, appliedStudents: { $ne: req.user.userid } },
            { $addToSet: { appliedStudents: req.user.userid } }
        );
        if (update.modifiedCount === 0) {
            return res.status(409).json({ success: false, message: 'Already applied to this company' });
        }

        res.status(200).json({ success: true, message: 'Marked as applied' });
    } catch (err) {
        console.error('Error applying to company:', err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// My tests — identity comes from the token, so no enrollment number is needed
const getMyTests = async (req, res) => {
    try {
        const tests = await Test.find({ studentId: req.user.userid }).sort({ date: 1 });
        const data = tests.map((test) => ({
            _id: test._id,
            companyName: test.companyName,
            testDate: test.date,
            description: test.description,
            testLink: test.testLink,
            location: test.location,
            status: test.status || 'Pending',
        }));
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching student tests:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// My results
const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ studentId: req.user.userid }).populate('companyId', 'name');
        const data = results.map((result) => ({
            _id: result._id,
            companyName: result.companyId?.name ?? 'Company removed',
            result: result.result,
            clearedRound: result.clearedRound,
        }));
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching student result:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Upcoming companies for my department (with an "applied" flag; the list of
// other applicants is never sent)
const getUpcomingCompanies = async (req, res) => {
    try {
        const student = await User.findById(req.user.userid).select('department');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const companies = await Company.find({
            department: student.department,
            applicationDeadline: { $gte: new Date() },
        })
            .select('name eligibility description applicationDeadline googleFormLink appliedStudents')
            .sort({ applicationDeadline: 1 })
            .lean();

        const uid = String(req.user.userid);
        const data = companies.map(({ appliedStudents = [], ...company }) => ({
            ...company,
            applied: appliedStudents.some((id) => String(id) === uid),
        }));

        res.status(200).json({ success: true, companies: data });
    } catch (error) {
        console.error('Error fetching upcoming companies:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getAllAlumniStories = async (req, res) => {
    try {
        const stories = await AlumniStory.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: stories });
    } catch (error) {
        console.error('Error fetching alumni stories:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getLearningMaterial = async (req, res) => {
    try {
        const materials = await LearningMaterial.find().sort({ uploadedAt: -1 });
        res.status(200).json({ success: true, data: materials });
    } catch (error) {
        console.error('Error fetching learning materials:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    getStudentProfile,
    uploadResume,
    getMyResume,
    getAppliedCompanies,
    applyToCompany,
    getUpcomingCompanies,
    getMyTests,
    getMyResults,
    getAllAlumniStories,
    getLearningMaterial,
};
