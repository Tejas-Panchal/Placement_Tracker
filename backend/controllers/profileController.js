const StudentProfile = require('../models/StudentProfile');

// Get the logged-in student's profile
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update the logged-in student's profile
exports.updateProfile = async (req, res) => {
  const { personalInfo, academicDetails, skills, projects, certifications } = req.body;

  try {
    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    if (personalInfo) profile.personalInfo = personalInfo;
    if (academicDetails) profile.academicDetails = academicDetails;
    if (skills) profile.skills = skills;
    if (projects) profile.projects = projects;
    if (certifications) profile.certifications = certifications;

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};