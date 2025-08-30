const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { 
  getAllStudents,
  getStudentById,
  getAllCompanies,
  getCompanyById,
  getPlacementStats,
  updatePlacementStatus,
  getTpoProfile,
  updateTpoProfile
} = require('../controllers/tpoController');

const tpoAuth = [authMiddleware, roleMiddleware('tpo')];

// TPO Profile routes
router.get('/profile', tpoAuth, getTpoProfile);
router.put('/profile', tpoAuth, updateTpoProfile);

// Student management routes
router.get('/students', tpoAuth, getAllStudents);
router.get('/students/:id', tpoAuth, getStudentById);
router.put('/students/:id/placement-status', tpoAuth, updatePlacementStatus);

// Company management routes
router.get('/companies', tpoAuth, getAllCompanies);
router.get('/companies/:id', tpoAuth, getCompanyById);

// Statistics routes
router.get('/statistics', tpoAuth, getPlacementStats);

module.exports = router;
