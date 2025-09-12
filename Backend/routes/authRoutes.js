// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { googleAuth, logoutUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/google', googleAuth);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;