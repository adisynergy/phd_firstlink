const express = require("express");
const { createEnclosure, getEnclosure } = require("../controllers/EnclosureController");
const { verifyJWT } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected
router.use(verifyJWT);

// Create or update enclosure
router.post("/create", createEnclosure);

// Get enclosure for current user
router.get("/get", getEnclosure);

module.exports = router; 