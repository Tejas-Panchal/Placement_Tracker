const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMyProfile, updateProfile } = require('../controllers/profileController');

router.get('/me', authMiddleware, getMyProfile);

router.put('/me', authMiddleware, updateProfile);

module.exports = router;