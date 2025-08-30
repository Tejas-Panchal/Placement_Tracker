const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  getMyProfile, 
  updateProfile, 
  applyToJob, 
  getUpcomingExams, 
  updateJobApplicationStatus 
} = require('../controllers/profileController');

// Get and update my profile
router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateProfile);

// Job application endpoints
router.post('/apply/:jobId', authMiddleware, applyToJob);
router.get('/exams', authMiddleware, getUpcomingExams);
router.put('/application/:applicationId', authMiddleware, updateJobApplicationStatus);

module.exports = router;