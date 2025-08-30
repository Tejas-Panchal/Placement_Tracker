const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
const mongoose = require('mongoose');

// Get the logged-in user's profile
exports.getMyProfile = async (req, res) => {
  try {
    let profile;
    
    if (req.user.role === 'student') {
      profile = await StudentProfile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);
    } else if (req.user.role === 'company') {
      profile = await CompanyProfile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);
    } else {
      return res.status(400).json({ msg: 'Invalid user role' });
    }

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update the logged-in user's profile
exports.updateProfile = async (req, res) => {
  try {
    let profile;
    
    if (req.user.role === 'student') {
      const { personalInfo, academicDetails, skills, projects, certifications } = req.body;
      
      profile = await StudentProfile.findOne({ user: req.user.id });
      
      if (!profile) {
        return res.status(404).json({ msg: 'Profile not found' });
      }

      if (personalInfo) profile.personalInfo = personalInfo;
      if (academicDetails) profile.academicDetails = academicDetails;
      if (skills) profile.skills = skills;
      if (projects) profile.projects = projects;
      if (certifications) profile.certifications = certifications;
    } 
    else if (req.user.role === 'company') {
      const { companyName, website, description } = req.body;
      
      profile = await CompanyProfile.findOne({ user: req.user.id });
      
      if (!profile) {
        return res.status(404).json({ msg: 'Profile not found' });
      }

      if (companyName) profile.companyName = companyName;
      if (website) profile.website = website;
      if (description) profile.description = description;
    } 
    else {
      return res.status(400).json({ msg: 'Invalid user role' });
    }

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Apply to a job
exports.applyToJob = async (req, res) => {
  try {
    // Only students can apply to jobs
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can apply to jobs' });
    }

    const { jobId } = req.params;

    // Validate jobId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: 'Invalid job ID' });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }

    // Check if already applied
    const alreadyApplied = studentProfile.appliedJobs.some(
      application => application.job.toString() === jobId
    );

    if (alreadyApplied) {
      return res.status(400).json({ msg: 'Already applied to this job' });
    }

    // Add to applied jobs
    studentProfile.appliedJobs.push({
      job: jobId,
      appliedDate: new Date(),
      status: 'Applied',
      examScheduled: {
        isScheduled: false
      }
    });

    await studentProfile.save();
    
    // Return the updated profile with applied jobs
    const updatedProfile = await StudentProfile.findOne({ user: req.user.id })
      .populate('appliedJobs.job', ['title', 'company', 'deadline'])
      .populate({
        path: 'appliedJobs.job',
        populate: {
          path: 'company',
          select: 'companyName'
        }
      });

    res.json(updatedProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get upcoming exams
exports.getUpcomingExams = async (req, res) => {
  try {
    // Only students can view upcoming exams
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can view upcoming exams' });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }

    // Get upcoming exams with populated job and company details
    const upcomingExams = await StudentProfile.findOne({ user: req.user.id })
      .select('upcomingExams')
      .populate({
        path: 'upcomingExams.job',
        select: 'title description company',
        populate: {
          path: 'company',
          select: 'companyName'
        }
      });

    res.json(upcomingExams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update job application status
exports.updateJobApplicationStatus = async (req, res) => {
  try {
    // Only students or TPOs can update job application status
    if (req.user.role !== 'student' && req.user.role !== 'tpo') {
      return res.status(403).json({ msg: 'Unauthorized to update application status' });
    }

    const { applicationId } = req.params;
    const { status, examDetails } = req.body;

    // Get the student profile
    let studentId = req.user.id;
    
    // If TPO is updating, they need to provide the student ID
    if (req.user.role === 'tpo') {
      if (!req.body.studentId) {
        return res.status(400).json({ msg: 'Student ID is required for TPO updates' });
      }
      studentId = req.body.studentId;
    }

    const studentProfile = await StudentProfile.findOne({ user: studentId });
    if (!studentProfile) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }

    // Find the application
    const applicationIndex = studentProfile.appliedJobs.findIndex(
      app => app._id.toString() === applicationId
    );

    if (applicationIndex === -1) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Update status
    if (status) {
      studentProfile.appliedJobs[applicationIndex].status = status;
    }

    // Update exam details if provided
    if (examDetails) {
      studentProfile.appliedJobs[applicationIndex].examScheduled = {
        isScheduled: true,
        examDate: examDetails.examDate,
        examTime: examDetails.examTime,
        examVenue: examDetails.examVenue,
        examType: examDetails.examType,
        round: examDetails.round || 'First Round'
      };
    }

    await studentProfile.save();

    // Return updated profile with populated job details
    const updatedProfile = await StudentProfile.findOne({ user: studentId })
      .populate('appliedJobs.job', ['title', 'company'])
      .populate({
        path: 'appliedJobs.job',
        populate: {
          path: 'company',
          select: 'companyName'
        }
      });

    res.json(updatedProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};