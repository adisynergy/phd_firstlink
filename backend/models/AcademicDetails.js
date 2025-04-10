const mongoose = require('mongoose');

const AcademicDetailsSchema = new mongoose.Schema({
  userid: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, "User ID is required"] 
  },

  research_interest: {
    branch: {
      type: String,
      enum: ['CSE', 'ECE', 'EIE', 'EEE', 'ME'],
      required: [true, "Research branch is required"]
    },
    area: {
      type: String,
      required: [true, "Research area is required"],
      trim: true
    }
  },

  qualifications: [
    {
      standard: { 
        type: String, 
        required: [true, "Standard is required"],
        enum: {
          values: ["10th", "12th", "UG", "PG", "PhD"],
          message: "{VALUE} is not a valid standard"
        }
      },
      degree_name: { 
        type: String, 
        required: [true, "Degree name is required"],
        trim: true
      },
      university: { 
        type: String, 
        required: [true, "University/Board name is required"],
        trim: true
      },
      year_of_completion: { 
        type: Number, 
        required: [true, "Year of completion is required"],
        min: [1900, "Invalid year"],
        max: [new Date().getFullYear(), "Year cannot be in the future"]
      },
      marks_type: { 
        type: String, 
        enum: {
          values: ["Percentage", "CGPA"],
          message: "{VALUE} is not a valid marks type"
        },
        required: [true, "Marks type is required"]
      },
      marks_obtained: { 
        type: Number, 
        required: [true, "Marks obtained is required"],
        min: [0, "Marks cannot be negative"],
        validate: {
          validator: function(v) {
            if (this.marks_type === "Percentage") {
              return v <= 100;
            } else if (this.marks_type === "CGPA") {
              return v <= this.max_cgpa;
            }
            return true;
          },
          message: "Marks exceed maximum value"
        }
      },
      max_cgpa: { 
        type: Number, 
        default: 10,
        validate: {
          validator: function(v) {
            return v > 0;
          },
          message: "Maximum CGPA must be greater than 0"
        }
      },
      branch: { 
        type: String,
        trim: true
      },
      program_duration_months: { 
        type: Number, 
        required: [true, "Program duration is required"],
        min: [1, "Duration must be at least 1 month"]
      },
      document_url: { 
        type: String,
        validate: {
          validator: function(v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: "Document URL must be valid"
        }
      },
      examination_results: {
        ug: {
          branch: { type: String },
          semesters: {
            I: { marks: String, class: String },
            II: { marks: String, class: String },
            III: { marks: String, class: String },
            IV: { marks: String, class: String },
            V: { marks: String, class: String },
            VI: { marks: String, class: String },
            VII: { marks: String, class: String },
            VIII: { marks: String, class: String }
          },
          aggregate: {
            cgpa: { type: String },
            class: { type: String },
            percentage: { type: String }
          }
        },
        pg: {
          branch: { type: String },
          semesters: {
            I: { marks: String, class: String },
            II: { marks: String, class: String },
            III: { marks: String, class: String },
            IV: { marks: String, class: String }
          },
          aggregate: {
            cgpa: { type: String },
            class: { type: String },
            percentage: { type: String }
          }
        },
        other: {
          degree_name: { type: String },
          branch: { type: String },
          semesters: [{
            semester: String,
            marks: String,
            class: String
          }],
          aggregate: {
            cgpa: { type: String },
            class: { type: String },
            percentage: { type: String }
          }
        }
      }
    }
  ],

  additional_qualifications: {
    type: [{
      exam_type: {
        type: String,
        enum: ['GATE', 'NET/CSIR/UGC/JRF/Lectureship/NBHM/Other'],
        required: [true, "Exam type is required"]
      },
      score: {
        type: Number,
        required: function() {
          return this.exam_type === 'GATE';
        }
      },
      qualifying_year: {
        type: Number,
        required: [true, "Qualifying year is required"],
        min: [1900, "Invalid year"],
        max: [new Date().getFullYear(), "Year cannot be in the future"]
      },
      date_of_exam: {
        type: Date,
        required: function() {
          return this.exam_type === 'NET/CSIR/UGC/JRF/Lectureship/NBHM/Other';
        }
      }
    }],
    default: []
  },

  experience: {
    type: [{
      type: { 
        type: String, 
        enum: {
          values: ["Industry", "Academia", "Research"],
          message: "{VALUE} is not a valid experience type"
        }
      },
      organisation: { 
        type: String,
        trim: true
      },
      place: { 
        type: String,
        trim: true
      },
      period_from: { 
        type: Date
      },
      period_to: { 
        type: Date,
        validate: {
          validator: function(v) {
            return !v || v >= this.period_from;
          },
          message: "End date must be after start date"
        }
      },
      monthly_compensation: { 
        type: Number,
        min: [0, "Compensation cannot be negative"]
      },
      designation: { 
        type: String,
        trim: true
      },
      nature_of_work: { 
        type: String,
        trim: true
      },
      experience_certificate_url: { 
        type: String,
        validate: {
          validator: function(v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: "Certificate URL must be valid"
        }
      }
    }],
    default: []
  },

  publications: {
    type: [{
      type: { 
        type: String, 
        enum: {
          values: ["Journal", "Conference", "Book"],
          message: "{VALUE} is not a valid publication type"
        }
      },
      paper_title: { 
        type: String,
        trim: true
      },
      affiliation: { 
        type: String,
        trim: true
      },
      acceptance_year: { 
        type: Number,
        min: [1900, "Invalid year"],
        max: [new Date().getFullYear(), "Year cannot be in the future"]
      },
      document_url: { 
        type: String,
        validate: {
          validator: function(v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: "Document URL must be valid"
        }
      }
    }],
    default: []
  }
}, { timestamps: true });

const AcademicDetails = mongoose.model("AcademicDetails", AcademicDetailsSchema);
module.exports = AcademicDetails;