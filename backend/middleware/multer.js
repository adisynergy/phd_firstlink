const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Use /tmp directory for Vercel compatibility
const uploadsDir = path.join(os.tmpdir(), 'phd-admission-uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Function to clean up old files
const cleanupOldFiles = () => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      // Delete files older than 1 hour
      if (now - stats.mtime.getTime() > 60 * 60 * 1000) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up uploads directory:', error);
  }
};

// Clean up old files when the server starts
cleanupOldFiles();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Clean up old files before storing new ones
    cleanupOldFiles();
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Image upload configuration
const imageUpload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Document upload configuration
const documentUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept PDF files only
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  }
});

module.exports = {
  imageUpload,
  documentUpload
};