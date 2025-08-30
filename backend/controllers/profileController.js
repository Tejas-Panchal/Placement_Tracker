const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');

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