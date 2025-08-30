const CompanyProfile = require('../models/CompanyProfile');
const StudentProfile = require('../models/StudentProfile');
const { User } = require('../models/User');
const Job = require('../models/Job');
const Offer = require('../models/Offer');

// Create a new job posting
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      jobType,
      positions,
      eligibilityCriteria,
      package,
      applicationDeadline,
      selectionProcess,
      isFeatured,
      attachments
    } = req.body;

    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
    if (!companyProfile) {
      return res.status(404).json({ msg: 'Company profile not found' });
    }

    const newJob = new Job({
      company: companyProfile._id,
      title,
      description,
      location,
      jobType: jobType || 'Full-time',
      positions: positions || 1,
      eligibilityCriteria,
      package,
      applicationDeadline,
      selectionProcess,
      isFeatured: isFeatured || false,
      attachments,
      createdBy: req.user.id,
      status: 'Open'
    });

    const job = await newJob.save();
    
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all jobs posted by the company
exports.getMyJobs = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
    if (!companyProfile) {
      return res.status(404).json({ msg: 'Company profile not found' });
    }

    const jobs = await Job.find({ company: companyProfile._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Filter and search jobs posted by the company
exports.filterJobs = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
    if (!companyProfile) {
      return res.status(404).json({ msg: 'Company profile not found' });
    }

    const {
      jobType,
      location,
      minCTC,
      maxCTC,
      fromDate,
      toDate,
      sort = 'createdAt',
      order = 'desc',
      limit = 10,
      page = 1
    } = req.query;

    const query = { company: companyProfile._id };

    if (status && ['Open', 'Closed', 'Filled', 'Cancelled'].includes(status)) {
      query.status = status;
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    if (minCTC || maxCTC) {
      query['package.totalCTC'] = {};
      if (minCTC) query['package.totalCTC'].$gte = parseInt(minCTC);
      if (maxCTC) query['package.totalCTC'].$lte = parseInt(maxCTC);
    }

    if (fromDate || toDate) {
      query.applicationDeadline = {};
      if (fromDate) query.applicationDeadline.$gte = new Date(fromDate);
      if (toDate) query.applicationDeadline.$lte = new Date(toDate);
    }

    let sortOptions = {};
    const validSortFields = ['createdAt', 'applicationDeadline', 'title', 'positions', 'package.totalCTC', 'status'];
    
    if (validSortFields.includes(sort)) {
      sortOptions[sort] = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const totalJobs = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'company',
        select: 'companyName'
      });

    const jobsWithStats = await Promise.all(jobs.map(async job => {
      const applicationCounts = await StudentProfile.aggregate([
        { $unwind: '$appliedJobs' },
        { $match: { 'appliedJobs.job': job._id } },
        { $group: { 
          _id: '$appliedJobs.status',
          count: { $sum: 1 }
        }}
      ]);

      const applicationStats = {
        total: 0,
        Applied: 0,
        Shortlisted: 0,
        Interviewed: 0,
        Rejected: 0,
        Offered: 0
      };

      applicationCounts.forEach(item => {
        if (item._id) {
          applicationStats[item._id] = item.count;
          applicationStats.total += item.count;
        }
      });

      const jobObject = job.toObject();
      jobObject.applicationStats = applicationStats;
      
      return jobObject;
    }));

    res.json({
      jobs: jobsWithStats,
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

// Update a job posting
exports.updateJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      jobType,
      positions,
      eligibilityCriteria,
      package,
      applicationDeadline,
      selectionProcess,
      status,
      isFeatured,
      attachments
    } = req.body;

    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
    if (!companyProfile) {
      return res.status(404).json({ msg: 'Company profile not found' });
    }

    // Find the job
    let job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if job belongs to this company
    if (job.company.toString() !== companyProfile._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized to update this job' });
    }

    // Update fields
    if (title) job.title = title;
    if (description) job.description = description;
    if (location) job.location = location;
    if (jobType) job.jobType = jobType;
    if (positions) job.positions = positions;
    if (eligibilityCriteria) job.eligibilityCriteria = eligibilityCriteria;
    if (package) job.package = package;
    if (applicationDeadline) job.applicationDeadline = applicationDeadline;
    if (selectionProcess) job.selectionProcess = selectionProcess;
    if (status) job.status = status;
    if (isFeatured !== undefined) job.isFeatured = isFeatured;
    if (attachments) job.attachments = attachments;

    await job.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Delete a job posting
exports.deleteJob = async (req, res) => {
  try {
    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
    if (!companyProfile) {
      return res.status(404).json({ msg: 'Company profile not found' });
    }

    // Find the job
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if job belongs to this company
    if (job.company.toString() !== companyProfile._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized to delete this job' });
    }

    await Job.deleteOne({ _id: job._id });
    res.json({ msg: 'Job deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get the company's own profile
exports.getCompanyProfile = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user: req.user.id })
      .populate('user', ['name', 'email', 'hrName', 'contactNumber']);

    if (!companyProfile) {
      return res.status(404).json({ msg: 'Company profile not found' });
    }

    res.json(companyProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update company profile
exports.updateCompanyProfile = async (req, res) => {
  const { companyName, website, description, industry, location, companySize, establishedYear } = req.body;

  try {
    let companyProfile = await CompanyProfile.findOne({ user: req.user.id });

    if (!companyProfile) {
      return res.status(404).json({ msg: 'Company profile not found' });
    }

    if (companyName) companyProfile.companyName = companyName;
    if (website) companyProfile.website = website;
    if (description) companyProfile.description = description;
    if (industry) companyProfile.industry = industry;
    if (location) companyProfile.location = location;
    if (companySize) companyProfile.companySize = companySize;
    if (establishedYear) companyProfile.establishedYear = establishedYear;

    await companyProfile.save();
    
    const updatedProfile = await CompanyProfile.findOne({ user: req.user.id })
      .populate('user', ['name', 'email', 'hrName', 'contactNumber']);

    res.json(updatedProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Search for students based on criteria
exports.searchStudents = async (req, res) => {
  try {
    const { skills, branch, cgpaMin, graduationYear } = req.query;
    
    let query = {};
    
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query.skills = { $in: skillsArray };
    }
    
    let students = await StudentProfile.find(query)
      .populate({
        path: 'user',
        select: 'name email branch graduationYear',
        match: {}
      })
      .select('-offers -upgradesUsed');
    
    if (branch || graduationYear || cgpaMin) {
      students = students.filter(student => {
        if (!student.user) return false;
        
        if (branch && student.user.branch !== branch) return false;
        
        if (graduationYear && student.user.graduationYear !== parseInt(graduationYear)) return false;
        
        if (cgpaMin && student.academicDetails && student.academicDetails.length > 0) {
          const highestCgpa = Math.max(...student.academicDetails.map(a => a.cgpa || 0));
          if (highestCgpa < parseFloat(cgpaMin)) return false;
        }
        
        return true;
      });
    }
    
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// View a specific student's profile (public info only)
exports.getStudentById = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findById(req.params.id)
      .populate('user', ['name', 'email', 'branch', 'graduationYear'])
      .select('-offers -upgradesUsed');
      
    if (!studentProfile) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }
    
    res.json(studentProfile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student profile not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Update HR information
exports.updateHrInfo = async (req, res) => {
  try {
    const { hrName, contactNumber } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (hrName) user.hrName = hrName;
    if (contactNumber) user.contactNumber = contactNumber;
    
    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Company dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
    
    if (!companyProfile) {
      return res.status(404).json({ msg: 'Company profile not found' });
    }
    
    // Get job counts
    const activeJobs = await Job.countDocuments({ 
      company: companyProfile._id, 
      status: 'Open' 
    });
    
    const closedJobs = await Job.countDocuments({ 
      company: companyProfile._id, 
      status: { $in: ['Closed', 'Filled', 'Cancelled'] } 
    });
    
    const totalJobs = activeJobs + closedJobs;
    
    // Get offer stats
    const pendingOffers = await Offer.countDocuments({
      company: companyProfile._id,
      status: 'Pending'
    });
    
    const acceptedOffers = await Offer.countDocuments({
      company: companyProfile._id,
      status: 'Accepted'
    });
    
    const rejectedOffers = await Offer.countDocuments({
      company: companyProfile._id,
      status: 'Rejected'
    });
    
    const totalOffers = pendingOffers + acceptedOffers + rejectedOffers;
    
    // Build stats object
    const stats = {
      company: {
        name: companyProfile.companyName,
        website: companyProfile.website,
        industry: companyProfile.industry,
        location: companyProfile.location
      },
      jobPostings: {
        active: activeJobs,
        closed: closedJobs,
        total: totalJobs
      },
      offers: {
        pending: pendingOffers,
        accepted: acceptedOffers,
        rejected: rejectedOffers,
        total: totalOffers,
        acceptanceRate: totalOffers > 0 ? ((acceptedOffers / totalOffers) * 100).toFixed(2) + '%' : '0%'
      }
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
