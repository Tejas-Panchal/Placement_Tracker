const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
const Job = require('../models/Job');
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
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can apply to jobs' });
    }

    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: 'Invalid job ID' });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }

    const alreadyApplied = studentProfile.appliedJobs.some(
      application => application.job.toString() === jobId
    );

    if (alreadyApplied) {
      return res.status(400).json({ msg: 'Already applied to this job' });
    }

    studentProfile.appliedJobs.push({
      job: jobId,
      appliedDate: new Date(),
      status: 'Applied',
      examScheduled: {
        isScheduled: false
      }
    });

    await studentProfile.save();
    
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
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can view upcoming exams' });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }

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
    if (req.user.role !== 'student' && req.user.role !== 'tpo') {
      return res.status(403).json({ msg: 'Unauthorized to update application status' });
    }

    const { applicationId } = req.params;
    const { status, examDetails } = req.body;

    let studentId = req.user.id;
    
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

    const applicationIndex = studentProfile.appliedJobs.findIndex(
      app => app._id.toString() === applicationId
    );

    if (applicationIndex === -1) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    if (status) {
      studentProfile.appliedJobs[applicationIndex].status = status;
    }

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

// Get all available jobs for students
exports.getAllAvailableJobs = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can view available jobs' });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }

    const {
      branch,
      minCGPA,
      graduationYear,
      jobType,
      location,
      company,
      minPackage,
      sort,
      limit = 20,
      page = 1
    } = req.query;

    // Build the query
    const query = {
      status: 'Open',
      applicationDeadline: { $gt: new Date() }
    };

    if (studentProfile.academicDetails) {
      if (studentProfile.academicDetails.branch) {
        query['eligibilityCriteria.branches'] = { 
          $exists: true, 
          $in: [studentProfile.academicDetails.branch]
        };
      }
      
      if (studentProfile.academicDetails.cgpa) {
        query['eligibilityCriteria.minCGPA'] = { 
          $exists: true,
          $lte: studentProfile.academicDetails.cgpa 
        };
      }
      
      if (studentProfile.academicDetails.graduationYear) {
        query['eligibilityCriteria.graduationYear'] = { 
          $exists: true,
          $eq: studentProfile.academicDetails.graduationYear 
        };
      }
    }

    if (branch) {
      query['eligibilityCriteria.branches'] = { $in: branch.split(',') };
    }
    
    if (minCGPA) {
      query['eligibilityCriteria.minCGPA'] = { $lte: parseFloat(minCGPA) };
    }
    
    if (graduationYear) {
      query['eligibilityCriteria.graduationYear'] = parseInt(graduationYear);
    }
    
    if (jobType) {
      query.jobType = jobType;
    }
    
    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };
    }
    
    if (minPackage) {
      query['package.totalCTC'] = { $gte: parseInt(minPackage) };
    }
    
    if (company) {
      const companyProfile = await CompanyProfile.findOne({ 
        companyName: { $regex: new RegExp(company, 'i') } 
      });
      
      if (companyProfile) {
        query.company = companyProfile._id;
      }
    }

    const appliedJobIds = studentProfile.appliedJobs.map(app => app.job.toString());
    
    if (appliedJobIds.length > 0) {
      query._id = { $nin: appliedJobIds };
    }

    let sortOption = { createdAt: -1 };
    
    if (sort === 'deadline') {
      sortOption = { applicationDeadline: 1 };
    } else if (sort === 'package') {
      sortOption = { 'package.totalCTC': -1 };
    } else if (sort === 'company') {
      sortOption = { company: 1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const totalJobs = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate({
        path: 'company',
        select: 'companyName website industry location'
      })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      jobs,
      pagination: {
        totalJobs,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalJobs / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};