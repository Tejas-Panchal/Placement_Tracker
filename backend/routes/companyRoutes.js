const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { createOffer, getCompanyOffers } = require('../controllers/offerController');
const { 
  createJob, 
  getMyJobs, 
  updateJob, 
  deleteJob,
  getCompanyProfile,
  updateCompanyProfile,
  searchStudents,
  getStudentById,
  updateHrInfo,
  getDashboardStats
} = require('../controllers/companyController');

// Middleware for company routes
const companyAuth = [authMiddleware, roleMiddleware('company')];

// Job posting routes
router.post('/jobs', companyAuth, createJob);
router.get('/jobs', companyAuth, getMyJobs);
router.put('/jobs/:jobId', companyAuth, updateJob);
router.delete('/jobs/:jobId', companyAuth, deleteJob);

// Company profile routes
router.get('/profile', companyAuth, getCompanyProfile);
router.put('/profile', companyAuth, updateCompanyProfile);
router.put('/hr-info', companyAuth, updateHrInfo);

// Dashboard stats
router.get('/dashboard', companyAuth, getDashboardStats);

// Student search and view
router.get('/students', companyAuth, searchStudents);
router.get('/students/:id', companyAuth, getStudentById);

// Offer routes
router.post('/offers', companyAuth, createOffer);
router.get('/offers', companyAuth, getCompanyOffers);

module.exports = router;