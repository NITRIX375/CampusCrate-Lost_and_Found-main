// backend/routes/claimRoutes.js
const express = require('express');
const router = express.Router();
const { createClaim, getItemClaims, updateClaimStatus,getMyClaims,deleteClaim,editClaim } = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');


router.get('/my-claims', protect, getMyClaims);
router.delete('/delete-claim/:claimId', protect, deleteClaim);
router.patch('/edit-claim/:claimId', protect, editClaim);
router.post('/', protect, createClaim);
router.get('/my-item-claims/:itemId', protect, getItemClaims);
router.patch('/:claimId/status', protect, updateClaimStatus);

module.exports = router;
