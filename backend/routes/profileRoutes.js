const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const profileController = require('../controllers/profileController');
const { 
  getMyProfile, 
  updateProfile, 
  applyToJob, 
  getUpcomingExams, 
  updateJobApplicationStatus,
  getAllAvailableJobs
} = require('../controllers/profileController');

// Get and update my profile
router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateProfile);


// Job application endpoints
router.post('/apply/:jobId', authMiddleware, applyToJob);
router.get('/exams', authMiddleware, getUpcomingExams);
router.put('/application/:applicationId', authMiddleware, updateJobApplicationStatus);

// Get all available jobs (student only)
router.get('/jobs', [authMiddleware, roleMiddleware('student')], getAllAvailableJobs);

module.exports = router;