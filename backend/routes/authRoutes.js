const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendOtp } = require('../controllers/authController');

// Define the route for sending an OTP.
// This tells Express: "When a POST request comes to '/send-otp',
// execute the 'sendOtp' function from the authController."
router.post('/send-otp', sendOtp);

// Define the route for the final registration.
router.post('/register', registerUser);

// Define the route for logging in.
router.post('/login', loginUser);

module.exports = router;