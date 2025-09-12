// backend/routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const { createItem, getItems, getItemById, markAsReturned, getMyListedItems,reportAbuse  } = require('../controllers/itemController'); // 👈 1. IMPORT getMyPosts
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/my-listed-items', protect, getMyListedItems);
router.post('/:id/report', protect, reportAbuse);
router.route('/')
  .post(protect, upload.single('photo'), createItem)
  .get(getItems);
  

  
router.route('/:id').get(getItemById);
router.route('/:id/return').patch(protect, markAsReturned);

module.exports = router;