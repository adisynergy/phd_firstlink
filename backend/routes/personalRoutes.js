const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
    createPersonal,
    getPersonal,
    updatePersonal,
    uploadPhoto,
    uploadSignature
} = require('../controllers/personalController');
const upload = require('../middleware/upload');

// Personal details routes
router.post('/', authenticateUser, createPersonal);
router.get('/', authenticateUser, getPersonal);
router.put('/', authenticateUser, updatePersonal);

// File upload routes
router.post('/upload-photo', authenticateUser, upload.single('photo'), uploadPhoto);
router.post('/upload-signature', authenticateUser, upload.single('signature'), uploadSignature);

module.exports = router; 