const PersonalDetails = require('../models/PersonalDetails');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

const createPersonal = async (req, res) => {
    try {
        console.log('Received personal details request:', {
            userid: req.user?._id,
            body: req.body
        });

        if (!req.user?._id) {
            console.error('User not found in request');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Remove user field from body if it exists to prevent override
        const { user, ...bodyWithoutUser } = req.body;

        // Validate required fields
        const requiredFields = [
            'first_name', 'last_name', 'date_of_birth', 'gender', 'nationality',
            'category', 'religion', 'father_name', 'mother_name',
            'marital_status', 'email', 'phone'
        ];

        const missingFields = requiredFields.filter(field => !bodyWithoutUser[field]);
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                fields: missingFields
            });
        }

        // Check if personal details already exist
        const existingDetails = await PersonalDetails.findOne({ user: req.user._id });
        if (existingDetails) {
            console.error('Personal details already exist for user:', req.user._id);
            return res.status(400).json({
                success: false,
                message: 'Personal details already exist for this user'
            });
        }

        const personalDetails = await PersonalDetails.create({
            user: req.user._id,
            ...bodyWithoutUser
        });

        console.log('Personal details created successfully:', personalDetails);
        return res.status(201).json({
            success: true,
            message: 'Personal details created successfully',
            data: personalDetails
        });
    } catch (error) {
        console.error('Error creating personal details:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error creating personal details',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getPersonal = async (req, res) => {
    try {
        const personalDetails = await PersonalDetails.findOne({ user: req.user._id });
        if (!personalDetails) {
            return res.status(404).json({ message: "Personal details not found" });
        }
        return res.status(200).json(personalDetails);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updatePersonal = async (req, res) => {
    try {
        console.log('Received update request:', req.body);
        
        if (!req.user?._id) {
            console.error('User not authenticated');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Validate required fields
        const requiredFields = [
            'first_name', 'last_name', 'date_of_birth', 'gender', 'nationality',
            'category', 'religion', 'father_name', 'mother_name',
            'marital_status', 'email', 'phone'
        ];
        
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Find and update the personal details
        const updatedDetails = await PersonalDetails.findOneAndUpdate(
            { user: req.user._id },
            { ...req.body },
            { 
                new: true,
                runValidators: true
            }
        );

        if (!updatedDetails) {
            return res.status(404).json({
                success: false,
                message: 'Personal details not found'
            });
        }

        console.log('Successfully updated personal details:', updatedDetails);

        res.status(200).json({
            success: true,
            message: 'Personal details updated successfully',
            data: updatedDetails
        });

    } catch (error) {
        console.error('Error updating personal details:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating personal details',
            error: error.message
        });
    }
};

const uploadPhoto = async (req, res) => {
    try {
        console.log('Starting photo upload process');
        
        if (!req.file) {
            console.error('No file received in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log('File received:', {
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });

        if (!req.user?._id) {
            console.error('User not found in request');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const response = await uploadOnCloudinary(req.file.path, {
            resource_type: 'image',
            folder: 'personal_documents'
        });
        
        if (!response) {
            console.error('Cloudinary upload failed');
            return res.status(500).json({ 
                message: 'Failed to upload photo to cloud storage',
                error: 'Cloudinary upload returned null'
            });
        }

        console.log('Cloudinary upload successful:', {
            url: response.secure_url,
            public_id: response.public_id
        });

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { user: req.user._id },
            { photo: response.secure_url },
            { new: true }
        );

        if (!personalDetails) {
            console.error('Could not update personal details with photo URL');
            return res.status(404).json({ 
                message: 'Personal details not found',
                error: 'Database update failed'
            });
        }

        // Clean up the temporary file
        if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('Temporary file cleaned up successfully');
        }

        return res.status(200).json({
            message: 'Photo uploaded successfully',
            photo: response.secure_url
        });
    } catch (error) {
        console.error('Error in photo upload process:', {
            error: error.message,
            stack: error.stack
        });
        
        // Clean up temporary file if it exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('Cleaned up temporary file after error');
            } catch (cleanupError) {
                console.error('Failed to clean up temporary file:', cleanupError);
            }
        }
        
        return res.status(500).json({ 
            message: 'Error uploading photo',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const uploadSignature = async (req, res) => {
    try {
        console.log('Starting signature upload process');
        
        if (!req.file) {
            console.error('No file received in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log('File received:', {
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });

        if (!req.user?._id) {
            console.error('User not found in request');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const response = await uploadOnCloudinary(req.file.path, {
            resource_type: 'image',
            folder: 'personal_documents'
        });
        
        if (!response) {
            console.error('Cloudinary upload failed');
            return res.status(500).json({ 
                message: 'Failed to upload signature to cloud storage',
                error: 'Cloudinary upload returned null'
            });
        }

        console.log('Cloudinary upload successful:', {
            url: response.secure_url,
            public_id: response.public_id
        });

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { user: req.user._id },
            { signature: response.secure_url },
            { new: true }
        );

        if (!personalDetails) {
            console.error('Could not update personal details with signature URL');
            return res.status(404).json({ 
                message: 'Personal details not found',
                error: 'Database update failed'
            });
        }

        // Clean up the temporary file
        if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('Temporary file cleaned up successfully');
        }

        return res.status(200).json({
            message: 'Signature uploaded successfully',
            signature: response.secure_url
        });
    } catch (error) {
        console.error('Error in signature upload process:', {
            error: error.message,
            stack: error.stack
        });
        
        // Clean up temporary file if it exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('Cleaned up temporary file after error');
            } catch (cleanupError) {
                console.error('Failed to clean up temporary file:', cleanupError);
            }
        }
        
        return res.status(500).json({ 
            message: 'Error uploading signature',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const uploadDemandDraft = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to Cloudinary with resource_type: 'raw' for PDFs
        const response = await uploadOnCloudinary(req.file.path, {
            resource_type: 'raw',
            folder: 'academic_documents'
        });
        
        if (!response) {
            return res.status(500).json({ message: 'Failed to upload demand draft' });
        }

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { user: req.user._id },
            { dd_url: response.secure_url },
            { new: true }
        );

        return res.status(200).json(personalDetails);
    } catch (error) {
        console.error('Error uploading demand draft:', error);
        return res.status(500).json({ message: 'Error uploading demand draft' });
    }
};

const uploadTransactionScreenshot = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!req.user?._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const response = await uploadOnCloudinary(req.file.path, {
            resource_type: 'image',
            folder: 'transaction_documents'
        });
        
        if (!response) {
            return res.status(500).json({ 
                message: 'Failed to upload transaction screenshot to cloud storage'
            });
        }

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { user: req.user._id },
            { 'transaction_details.transaction_screenshot_url': response.secure_url },
            { new: true }
        );

        if (!personalDetails) {
            return res.status(404).json({ message: 'Personal details not found' });
        }

        // Clean up the temporary file
        if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(200).json({
            message: 'Transaction screenshot uploaded successfully',
            url: response.secure_url
        });
    } catch (error) {
        console.error('Error uploading transaction screenshot:', error);
        return res.status(500).json({ 
            message: 'Error uploading transaction screenshot',
            error: error.message
        });
    }
};

const updateTransactionDetails = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { transaction_id, transaction_date, issued_bank } = req.body;

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { user: req.user._id },
            {
                'transaction_details.transaction_id': transaction_id,
                'transaction_details.transaction_date': transaction_date,
                'transaction_details.issued_bank': issued_bank
            },
            { new: true }
        );

        if (!personalDetails) {
            return res.status(404).json({ message: 'Personal details not found' });
        }

        return res.status(200).json({
            message: 'Transaction details updated successfully',
            data: personalDetails.transaction_details
        });
    } catch (error) {
        console.error('Error updating transaction details:', error);
        return res.status(500).json({ 
            message: 'Error updating transaction details',
            error: error.message
        });
    }
};

const updateDeclaration = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { place, date } = req.body;

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { user: req.user._id },
            {
                'declaration.place': place,
                'declaration.date': date
            },
            { new: true }
        );

        if (!personalDetails) {
            return res.status(404).json({ message: 'Personal details not found' });
        }

        return res.status(200).json({
            message: 'Declaration updated successfully',
            data: personalDetails.declaration
        });
    } catch (error) {
        console.error('Error updating declaration:', error);
        return res.status(500).json({ 
            message: 'Error updating declaration',
            error: error.message
        });
    }
};

const updateEnclosures = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const enclosures = req.body;

        const personalDetails = await PersonalDetails.findOneAndUpdate(
            { user: req.user._id },
            { enclosures },
            { new: true }
        );

        if (!personalDetails) {
            return res.status(404).json({ message: 'Personal details not found' });
        }

        return res.status(200).json({
            message: 'Enclosures updated successfully',
            data: personalDetails.enclosures
        });
    } catch (error) {
        console.error('Error updating enclosures:', error);
        return res.status(500).json({ 
            message: 'Error updating enclosures',
            error: error.message
        });
    }
};

module.exports = {
    createPersonal,
    getPersonal,
    updatePersonal,
    uploadPhoto,
    uploadSignature,
    uploadDemandDraft,
    uploadTransactionScreenshot,
    updateTransactionDetails,
    updateDeclaration,
    updateEnclosures
};
