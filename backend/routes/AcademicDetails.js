const express = require("express");
const router = express.Router();
const { documentUpload } = require("../middleware/multer"); 
const { uploadDocument } = require("../controllers/uploadController");
const { createAcademic, getAcademic, updateAcademic } = require("../controllers/AcademicController");
const { verifyJWT } = require("../middleware/authMiddleware");

// 🔹 Upload Academic Documents
router.post("/upload-document", verifyJWT, documentUpload.single("document"), uploadDocument);

// 🔹 Other Academic Routes
router.post("/create", verifyJWT, createAcademic);
router.get("/get", verifyJWT, getAcademic);
router.put("/update", verifyJWT, updateAcademic);

module.exports = router;