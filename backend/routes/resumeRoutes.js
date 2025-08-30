const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const { 
    createResume, 
    getResumes, 
    getResumeById, 
    updateResume, 
    deleteResume,
    generatePDF
} = require('../controllers/resumeController');

// Get all resumes for the authenticated student
router.get('/', authMiddleware, getResumes);

// Get a specific resume by ID
router.get('/:id', authMiddleware, getResumeById);

// Create a new resume
router.post('/', authMiddleware, createResume);

// Update an existing resume
router.put('/:id', authMiddleware, updateResume);

// Delete a resume
router.delete('/:id', authMiddleware, deleteResume);

// Generate PDF from resume
router.get('/:id/pdf', authMiddleware, generatePDF);

module.exports = router;
