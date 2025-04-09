const cloudinary = require('cloudinary').v2;
const fs = require("fs");
const os = require("os");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

//Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS
});

// Function to clean up old temporary files
const cleanupTempFiles = (directory) => {
  try {
    const files = fs.readdirSync(directory);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      // Delete files older than 1 hour
      if (now - stats.mtime.getTime() > 60 * 60 * 1000) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
  }
};

const uploadOnCloudinary = async (filePath, options = {}) => {
  try {
    // Clean up old files before uploading new ones
    cleanupTempFiles(path.dirname(filePath));

    // Ensure we're using a temporary file path
    const tempDir = os.tmpdir();
    const fileName = path.basename(filePath);
    const tempFilePath = path.join(tempDir, fileName);

    // Copy the file to temp directory if it's not already there
    if (filePath !== tempFilePath) {
      fs.copyFileSync(filePath, tempFilePath);
    }

    const result = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: options.resource_type || 'auto',
      folder: options.folder || 'uploads',
      secure: true, // Force HTTPS
      ...options
    });
    
    // Clean up the temporary file
    try {
      fs.unlinkSync(tempFilePath);
      fs.unlinkSync(filePath); // Also clean up the original file
    } catch (error) {
      console.warn('Warning: Could not delete temporary file:', error);
    }
    
    // Ensure the URL is HTTPS
    if (result.secure_url) {
      result.secure_url = result.secure_url.replace(/^http:/, 'https:');
    }
    if (result.url) {
      result.url = result.url.replace(/^http:/, 'https:');
    }
    
    return result;
  } catch (error) {
    // Clean up on error
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.warn('Warning: Could not delete file after error:', cleanupError);
    }
    
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};

const deleteFromCloudinary = async (imageUrl, resourceType = 'image') => {
    try {
        if(!imageUrl) return null;
        const response = await cloudinary.uploader.destroy(imageUrl, {
            resource_type: resourceType
        })
        console.log("Cloudinary Deletion Response", response);
        return response
    } catch(error) {
        console.error("Error occurred while deleting from Cloudinary", error.message)
        throw {success: false, message: error.message, statusCode: 500};
    }
}

module.exports = { uploadOnCloudinary, deleteFromCloudinary };
