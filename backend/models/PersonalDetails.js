const mongoose = require('mongoose');

const PersonalDetailsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Personal Information
    first_name: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters long'],
        maxlength: [30, 'First name cannot exceed 30 characters'],
        match: [/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces']
    },
    last_name: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters long'],
        maxlength: [30, 'Last name cannot exceed 30 characters'],
        match: [/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces']
    },
    date_of_birth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function(dob) {
                const today = new Date();
                const birthDate = new Date(dob);
                const age = today.getFullYear() - birthDate.getFullYear();
                return age >= 18 && age <= 50;
            },
            message: 'Age must be between 18 and 50 years'
        }
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female', 'Other']
    },
    nationality: {
        type: String,
        required: [true, 'Nationality is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['General', 'OBC', 'SC', 'ST', 'Other']
    },
    physically_challenged: {
        type: Boolean,
        required: [true, 'Physically challenged status is required'],
        default: false
    },
    religion: {
        type: String,
        required: [true, 'Religion is required'],
        trim: true
    },
    father_name: {
        type: String,
        required: [true, "Father's name is required"],
        trim: true
    },
    mother_name: {
        type: String,
        required: [true, "Mother's name is required"],
        trim: true
    },
    marital_status: {
        type: String,
        required: [true, 'Marital status is required'],
        enum: ['Single', 'Married', 'Divorced', 'Widowed']
    },
    spouse_name: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || (this.marital_status !== 'Single' && v.length > 0);
            },
            message: "Spouse name is required for married, divorced, or widowed applicants"
        }
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },

    // Programme Information
    programme_type: {
        type: String,
        required: [true, 'Programme type is required'],
        enum: ['Ph.D.', 'M.Phil.', 'M.Tech.', 'M.Sc.'],
        default: 'Ph.D.'
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: [
            'Computer Science and Engineering',
            'Electronics and Communication Engineering',
            'Mechanical Engineering',
            'Civil Engineering',
            'Electrical Engineering',
            'Chemical Engineering',
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biotechnology',
            'Management Studies'
        ]
    },
    mode_of_phd: {
        type: String,
        required: [true, 'Mode of PhD is required'],
        enum: ['Full Time', 'Part Time', 'Full Time (Sponsored)']
    },

    // Address Information
    current_address: {
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        pincode: {
            type: String,
            required: [true, 'PIN code is required'],
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit PIN code']
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            default: 'India'
        }
    },
    permanent_address: {
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        pincode: {
            type: String,
            required: [true, 'PIN code is required'],
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit PIN code']
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            default: 'India'
        }
    },

    // Document Uploads
    photo: {
        url: String,
        public_id: String
    },
    signature: {
        url: String,
        public_id: String
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'submitted'],
        default: 'draft'
    },
    submitted_at: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
PersonalDetailsSchema.index({ user: 1 });
PersonalDetailsSchema.index({ email: 1 });
PersonalDetailsSchema.index({ programme_type: 1 });
PersonalDetailsSchema.index({ department: 1 });
PersonalDetailsSchema.index({ mode_of_phd: 1 });

module.exports = mongoose.model('PersonalDetails', PersonalDetailsSchema); 