const { Student, User } = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const CompanyProfile = require("../models/CompanyProfile");

// Get all students for TPO
exports.getAllStudents = async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .populate({
        path: 'user',
        select: 'name email enrollmentNumber branch graduationYear'
      });

    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get student details by ID
exports.getStudentById = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email enrollmentNumber branch graduationYear'
      });

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

// Get all companies for TPO
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await CompanyProfile.find()
      .populate({
        path: 'user',
        select: 'name email hrName contactNumber'
      });

    res.json(companies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get company details by ID
exports.getCompanyById = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email hrName contactNumber'
      });

    if (!companyProfile) {
      return res.status(404).json({ msg: 'Company profile not found' });
    }

    res.json(companyProfile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Company profile not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get placement statistics
exports.getPlacementStats = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    
    const placedStudents = await StudentProfile.countDocuments({ placementStatus: 'Placed' });
    
    const withNoOffers = await StudentProfile.countDocuments({ 'offers.0': { $exists: false } });
    const withOneOffer = await StudentProfile.countDocuments({ 
      $and: [
        { 'offers.0': { $exists: true } },
        { 'offers.1': { $exists: false } }
      ] 
    });
    const withMultipleOffers = await StudentProfile.countDocuments({ 'offers.1': { $exists: true } });
    
    const students = await StudentProfile.find({ placementStatus: 'Placed' })
      .populate({
        path: 'user',
        select: 'branch'
      });

    const branchStats = {};
    students.forEach(student => {
      if (student.user && student.user.branch) {
        const branch = student.user.branch;
        branchStats[branch] = (branchStats[branch] || 0) + 1;
      }
    });
    
    res.json({
      totalStudents,
      placedStudents,
      unplacedStudents: totalStudents - placedStudents,
      placementPercentage: totalStudents ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0,
      offerStats: {
        withNoOffers,
        withOneOffer,
        withMultipleOffers
      },
      branchWiseStats: branchStats
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update student placement status
exports.updatePlacementStatus = async (req, res) => {
  try {
    const { placementStatus } = req.body;
    
    if (!['Not Placed', 'Placed'].includes(placementStatus)) {
      return res.status(400).json({ msg: 'Invalid placement status' });
    }
    
    const studentProfile = await StudentProfile.findById(req.params.id);
    
    if (!studentProfile) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }
    
    studentProfile.placementStatus = placementStatus;
    await studentProfile.save();
    
    res.json(studentProfile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student profile not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get TPO profile
exports.getTpoProfile = async (req, res) => {
  try {
    const tpo = await User.findById(req.user.id).select('-password');
    
    if (!tpo) {
      return res.status(404).json({ msg: 'TPO profile not found' });
    }
    
    res.json(tpo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update TPO profile
exports.updateTpoProfile = async (req, res) => {
  try {
    const { instituteName, contactNumber } = req.body;
    
    const tpo = await User.findById(req.user.id);
    
    if (!tpo) {
      return res.status(404).json({ msg: 'TPO profile not found' });
    }
    
    if (instituteName) tpo.instituteName = instituteName;
    if (contactNumber) tpo.contactNumber = contactNumber;
    
    await tpo.save();
    
    // Return the updated profile without the password
    const updatedTpo = await User.findById(req.user.id).select('-password');
    res.json(updatedTpo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
