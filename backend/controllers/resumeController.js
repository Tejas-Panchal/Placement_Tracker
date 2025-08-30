const Resume = require('../models/Resume');
const StudentProfile = require('../models/StudentProfile');

// Get all resumes for the authenticated student
exports.getResumes = async (req, res) => {
    try {
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });
        
        if (!studentProfile) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        
        const resumes = await Resume.find({ student: studentProfile._id });
        
        res.json(resumes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get a specific resume by ID
exports.getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });
        
        if (resume.student.toString() !== studentProfile._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to access this resume' });
        }
        
        res.json(resume);
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create a new resume
exports.createResume = async (req, res) => {
    try {
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });
        
        if (!studentProfile) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        
        const { template, data, version } = req.body;
        
        const newResume = new Resume({
            student: studentProfile._id,
            template,
            data,
            version
        });
        
        const resume = await newResume.save();
        
        res.json(resume);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update an existing resume
exports.updateResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });
        
        if (resume.student.toString() !== studentProfile._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this resume' });
        }
        
        const { template, data, version } = req.body;
        
        if (template) resume.template = template;
        if (data) resume.data = data;
        if (version) resume.version = version;
        
        await resume.save();
        
        res.json(resume);
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete a resume
exports.deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });
        
        if (resume.student.toString() !== studentProfile._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this resume' });
        }
        
        await resume.remove();
        
        res.json({ message: 'Resume deleted' });
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// Generate PDF from resume (placeholder - you'll need to implement PDF generation)
exports.generatePDF = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });
        
        if (resume.student.toString() !== studentProfile._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to access this resume' });
        }
        
        res.json({ message: 'PDF generation endpoint (implementation needed)' });
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};
