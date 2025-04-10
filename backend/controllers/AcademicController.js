const AcademicDetails = require('../models/AcademicDetails');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create uploads directory if it doesn't exist
const uploadsDir = '/tmp/uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 🔹 Add/Update Academic Details
const createAcademic = async (req, res) => {
  try {
    console.log('=== Starting createAcademic ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User from JWT:', JSON.stringify(req.user, null, 2));

    // Check if academic details already exist
    const existingAcademic = await AcademicDetails.findOne({ userid: req.user._id });
    console.log('Existing academic details:', existingAcademic);
    
    if (existingAcademic) {
      console.log('Updating existing academic details...');
      // Update existing academic details
      const updatedAcademic = await AcademicDetails.findOneAndUpdate(
        { userid: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      console.log('Updated academic details:', updatedAcademic);
      return res.status(200).json({
        success: true,
        message: "Academic details updated successfully",
        academic: updatedAcademic
      });
    }

    console.log('Creating new academic details...');
    // Create new academic details
    const academic = new AcademicDetails({
      ...req.body,
      userid: req.user._id // Use the user ID from JWT middleware
    });

    // Validate examination results if present
    if (academic.qualifications && academic.qualifications.length > 0) {
      for (const qualification of academic.qualifications) {
        if (qualification.examination_results) {
          // Validate UG results only for UG qualifications
          if (qualification.standard === "UG" && qualification.examination_results.ug) {
            const ug = qualification.examination_results.ug;
            // Removed validation for UG results
          }

          // Validate PG results only for PG qualifications
          if (qualification.standard === "PG" && qualification.examination_results.pg) {
            const pg = qualification.examination_results.pg;
            // Set branch from the qualification's branch field if it's a valid branch
            const validBranches = ["CSE", "ECE", "EIE", "EEE", "ME"];
            if (validBranches.includes(qualification.branch)) {
              pg.branch = qualification.branch;
            } else {
              // If branch is not valid, set it to the research interest branch if it's valid
              if (validBranches.includes(academic.research_interest.branch)) {
                pg.branch = academic.research_interest.branch;
              }
            }
            // Removed validation for PG results
          }
        }
      }
    }

    // Log the academic object before validation
    console.log('Academic object before validation:', JSON.stringify(academic, null, 2));

    // Validate before saving
    const validationError = academic.validateSync();
    if (validationError) {
      console.error('Validation error:', JSON.stringify(validationError.errors, null, 2));
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationError.errors
      });
    }

    console.log('Validation passed, saving to database...');
    await academic.save();
    console.log('Successfully saved to database');
    
    return res.status(201).json({
      success: true,
      message: "Academic details created successfully",
      academic
    });
  } catch (error) {
    console.error('=== Error in createAcademic ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.errors
      });
    }

    // Handle other types of errors
    return res.status(500).json({ 
      success: false,
      message: "Error saving academic details",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getAcademic = async (req, res) => {
  try {
    const academic = await AcademicDetails.findOne({ userid: req.user._id });
    if (!academic) {
      return res.status(404).json({ message: "Academic details not found" });
    }
    return res.status(200).json(academic);
  } catch (error) {
    console.error("Error in getAcademic:", error);
    return res.status(500).json({ 
      message: "Error fetching academic details",
      error: error.message 
    });
  }
};

const updateAcademic = async (req, res) => {
  try {
    const academic = await AcademicDetails.findOneAndUpdate(
      { userid: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!academic) {
      return res.status(404).json({ message: "Academic details not found" });
    }

    // Validate examination results if present
    if (academic.qualifications && academic.qualifications.length > 0) {
      for (const qualification of academic.qualifications) {
        if (qualification.examination_results) {
          // Validate UG results only for UG qualifications
          if (qualification.standard === "UG" && qualification.examination_results.ug) {
            const ug = qualification.examination_results.ug;
            // Removed validation for UG results
          }

          // Validate PG results only for PG qualifications
          if (qualification.standard === "PG" && qualification.examination_results.pg) {
            const pg = qualification.examination_results.pg;
            // Set branch from the qualification's branch field if it's a valid branch
            const validBranches = ["CSE", "ECE", "EIE", "EEE", "ME"];
            if (validBranches.includes(qualification.branch)) {
              pg.branch = qualification.branch;
            } else {
              // If branch is not valid, set it to the research interest branch if it's valid
              if (validBranches.includes(academic.research_interest.branch)) {
                pg.branch = academic.research_interest.branch;
              }
            }
            // Removed validation for PG results
          }
        }
      }
    }
    
    return res.status(200).json({
      message: "Academic details updated successfully",
      academic
    });
  } catch (error) {
    console.error("Error in updateAcademic:", error);
    return res.status(500).json({ 
      message: "Error updating academic details",
      error: error.message 
    });
  }
};

const uploadAcademicDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    // Validate file size (5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "File size should be less than 5MB" });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'academic_documents',
      resource_type: 'raw' // Changed from 'auto' to 'raw' for PDFs
    });
    
    if (!uploadResult) {
      return res.status(500).json({ message: "Failed to upload file" });
    }

    // Get the document type from the request
    const { documentType, index } = req.body;

    // Update the academic details with the document URL based on document type
    let updateQuery = {};
    if (documentType === 'qualification') {
      updateQuery = {
        $set: { [`qualifications.${index}.document_url`]: uploadResult.secure_url }
      };
    } else if (documentType === 'experience') {
      updateQuery = {
        $set: { [`experience.${index}.experience_certificate_url`]: uploadResult.secure_url }
      };
    } else if (documentType === 'publication') {
      updateQuery = {
        $set: { [`publications.${index}.document_url`]: uploadResult.secure_url }
      };
    } else {
      return res.status(400).json({ message: "Invalid document type" });
    }

    const academic = await AcademicDetails.findOneAndUpdate(
      { userid: req.user._id },
      updateQuery,
      { new: true }
    );

    // Clean up the temporary file
    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      message: "Document uploaded successfully",
      url: uploadResult.secure_url,
      academic
    });
  } catch (error) {
    console.error("Error in uploadAcademicDocument:", error);
    
    // Clean up temporary file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ 
      message: "Error uploading document",
      error: error.message 
    });
  }
};

const createAcademicDetails = async (req, res) => {
  try {
    const userid = req.user._id;
    const { qualifications, experience, publications } = req.body;

    // Create new academic details
    const academicDetails = new AcademicDetails({
      userid,
      qualifications,
      experience,
      publications
    });

    await academicDetails.save();

    res.status(201).json({
      success: true,
      message: 'Academic details created successfully',
      data: academicDetails
    });
  } catch (error) {
    console.error('Error creating academic details:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating academic details',
      error: error.message
    });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'academic_documents',
      resource_type: 'raw' // Changed from 'auto' to 'raw' for PDFs
    });

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Clean up temporary file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

module.exports = { 
  createAcademic, 
  getAcademic, 
  updateAcademic, 
  uploadAcademicDocument,
  createAcademicDetails,
  uploadFile
};