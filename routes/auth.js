const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateRegistration, validateLogin, validate } = require('../middleware/validate');

// Register route
router.post('/register', validateRegistration, validate, register);

// Login route
router.post('/login', validateLogin, validate, login);

// Protected route - Get user profile
router.get('/profile', auth, getProfile);

module.exports = router;