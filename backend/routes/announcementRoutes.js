const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');

// Get all announcements (available to all authenticated users)
router.get('/', authMiddleware, getAnnouncements);

// Get announcement by ID (available to all authenticated users)
router.get('/:id', authMiddleware, getAnnouncementById);

// Create new announcement (restricted to TPO users)
router.post('/', [authMiddleware, roleMiddleware('tpo')], createAnnouncement);

// Update announcement (author or TPO only)
router.put('/:id', authMiddleware, updateAnnouncement);

// Delete announcement (author or TPO only)
router.delete('/:id', authMiddleware, deleteAnnouncement);

module.exports = router;
