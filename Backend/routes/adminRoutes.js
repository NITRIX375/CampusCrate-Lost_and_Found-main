// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getAllItemsForAdmin, approveItem, deleteItem, getAllUsers, toggleBlockUser,getAbuseReports,updateReportStatus } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/reports', protect, admin, getAbuseReports); // View abuse reports
router.patch('/reports/:id/status', protect, admin, updateReportStatus);
router.get('/items', protect, admin, getAllItemsForAdmin);
router.patch('/items/:id/approve', protect, admin, approveItem);
router.delete('/items/:id', protect, admin, deleteItem);
router.get('/users', protect, admin, getAllUsers);
router.patch('/users/:id/block', protect, admin, toggleBlockUser);

module.exports = router;