const Payment = require('../models/Payment');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

const createPayment = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Check if payment already exists for this user
        const existingPayment = await Payment.findOne({ user: req.user._id });
        if (existingPayment) {
            return res.status(400).json({ 
                message: 'Payment details already exist for this user' 
            });
        }

        // Validate required fields
        if (!req.body.screenshot?.url) {
            return res.status(400).json({ 
                message: 'Transaction screenshot URL is required' 
            });
        }

        const payment = await Payment.create({
            user: req.user._id,
            transaction_id: req.body.transaction_id,
            transaction_date: req.body.transaction_date,
            issued_bank: req.body.issued_bank,
            amount: req.body.amount,
            screenshot: {
                url: req.body.screenshot.url
            },
            status: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: 'Payment details saved successfully',
            data: payment
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        return res.status(500).json({ 
            message: 'Error creating payment',
            error: error.message
        });
    }
};

const getPayment = async (req, res) => {
    try {
        console.log('Getting payment for user:', req.user?._id);
        
        if (!req.user?._id) {
            console.log('No user ID found in request');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        console.log('Searching for payment with user ID:', req.user._id);
        const payment = await Payment.findOne({ user: req.user._id });
        
        console.log('Payment found:', payment);
        if (!payment) {
            console.log('No payment found for user');
            return res.status(404).json({ message: 'Payment details not found' });
        }

        return res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        return res.status(500).json({ 
            message: 'Error fetching payment',
            error: error.message
        });
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

        const payment = await Payment.findOneAndUpdate(
            { userid: req.user._id },
            { transaction_screenshot_url: response.secure_url },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ message: 'Payment details not found' });
        }

        // Clean up the temporary file
        if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(200).json({
            success: true,
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

const updatePayment = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const payment = await Payment.findOneAndUpdate(
            { user: req.user._id },
            req.body,
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ message: 'Payment details not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Payment details updated successfully',
            data: payment
        });
    } catch (error) {
        console.error('Error updating payment:', error);
        return res.status(500).json({ 
            message: 'Error updating payment',
            error: error.message
        });
    }
};

module.exports = {
    createPayment,
    getPayment,
    uploadTransactionScreenshot,
    updatePayment
}; 