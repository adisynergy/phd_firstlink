const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/multer');
const {
    createPayment,
    getPayment,
    uploadTransactionScreenshot,
    updatePayment
} = require('../controllers/paymentController');

// Apply JWT verification to all routes
router.use(verifyJWT);

// Create payment details
router.post('/create', createPayment);

// Get payment details
router.get('/get', getPayment);

// Upload transaction screenshot
router.post('/upload-screenshot', 
    imageUpload.single('document'),
    uploadTransactionScreenshot
);

// Update payment details
router.put('/update', updatePayment);

module.exports = router; 