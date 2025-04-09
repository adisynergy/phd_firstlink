const mongoose = require("mongoose");

const enclosureSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  enclosures: {
    transaction_details: {
      type: Boolean,
      default: false
    },
    matriculation: {
      type: Boolean,
      default: false
    },
    intermediate: {
      type: Boolean,
      default: false
    },
    bachelors: {
      type: Boolean,
      default: false
    },
    masters: {
      type: Boolean,
      default: false
    },
    gate_net: {
      type: Boolean,
      default: false
    },
    doctors_certificate: {
      type: Boolean,
      default: false
    },
    community_certificate: {
      type: Boolean,
      default: false
    },
    experience_letter: {
      type: Boolean,
      default: false
    },
    government_id: {
      type: Boolean,
      default: false
    },
    research_publications: {
      type: Boolean,
      default: false
    }
  },
  additional_info: {
    type: String,
    default: ""
  },
  declaration: {
    place: {
      type: String,
      default: ""
    },
    date: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Pre-save middleware for logging
enclosureSchema.pre('save', function(next) {
  console.log('Attempting to save enclosure:', {
    userId: this.user,
    enclosures: this.enclosures,
    isNew: this.isNew
  });
  next();
});

// Post-save middleware for logging
enclosureSchema.post('save', function(doc, next) {
  console.log('Enclosure saved successfully:', {
    id: doc._id,
    userId: doc.user,
    enclosures: doc.enclosures
  });
  next();
});

// Post-save error handler
enclosureSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error('Error saving enclosure:', {
      error: error.message,
      stack: error.stack,
      userId: doc?.user,
      enclosures: doc?.enclosures
    });
  }
  next(error);
});

const Enclosure = mongoose.model('Enclosure', enclosureSchema);

module.exports = Enclosure; 