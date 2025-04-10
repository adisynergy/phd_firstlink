const express = require('express');
const { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser } = require('../controllers/authController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// 🔹 Register New User
router.post("/register", registerUser);

// 🔹 Login User
router.post("/login", loginUser);

// 🔹 Logout User
router.post("/logout", verifyJWT, logoutUser);

// 🔹 Refresh Access Token
router.post("/refresh-token", refreshAccessToken);

// 🔹 Get Current User
router.get("/current-user", verifyJWT, getCurrentUser);

module.exports = router;