const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createOffer,
  getCompanyOffers,
  getStudentOffers,
  updateOfferStatus,
  getOfferById
} = require('../controllers/offerController');

// Create a new offer (company only)
router.post('/', [authMiddleware, roleMiddleware('company')], createOffer);

// Get all offers made by the company (company only)
router.get('/company', [authMiddleware, roleMiddleware('company')], getCompanyOffers);

// Get all offers for a student (student can get own offers, TPO can get any student's offers)
router.get('/student/me', [authMiddleware, roleMiddleware('student')], getStudentOffers);
router.get('/student/:studentId', [authMiddleware, roleMiddleware('tpo')], getStudentOffers);

// Update offer status (student only)
router.put('/:id/status', [authMiddleware, roleMiddleware('student')], updateOfferStatus);

// Get offer details by ID (accessible to all parties involved)
router.get('/:id', authMiddleware, getOfferById);

module.exports = router;
