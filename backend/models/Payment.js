const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transaction_id: {
        type: String,
        required: [true, 'Transaction ID is required'],
        trim: true
    },
    transaction_date: {
        type: Date,
        required: [true, 'Transaction date is required']
    },
    issued_bank: {
        type: String,
        required: [true, 'Bank name is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    screenshot: {
        url: {
            type: String,
            required: [true, 'Transaction screenshot is required']
        },
        
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verified_at: {
        type: Date
    },
    rejection_reason: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for faster queries
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ transaction_id: 1 });
PaymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', PaymentSchema); 