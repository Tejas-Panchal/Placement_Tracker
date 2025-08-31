const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OfferSchema = new Schema({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    required: true
  },
  package: {
    type: Number
  },
  tier: {
    type: String,
    enum: ['Tier 1', 'Tier 2', 'Tier 3', 'Super Dream', 'Dream', 'Regular']
  },
  applicationDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  offerDetails: {
    type: String
  },
  offerDate: {
    type: Date,
    default: Date.now
  },
  responseDate: {
    type: Date
  },
  joiningDate: {
    type: Date
  },
  documents: [
    {
      name: String,
      url: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  additionalInfo: {
    type: Object
  }
}, {
  timestamps: true
});

// Pre-save middleware to set tier based on package if not explicitly provided
OfferSchema.pre('save', function(next) {
  // If tier is already set or package is not set, don't try to determine tier
  if (this.tier || !this.package) {
    return next();
  }
  
  // Set tier based on package
  if (this.package >= 1800000) { // ₹18 LPA or more
    this.tier = 'Super Dream';
  } else if (this.package >= 1000000) { // ₹10 LPA or more
    this.tier = 'Dream';
  } else {
    this.tier = 'Regular';
  }
  
  next();
});

// When status changes to 'Accepted' or 'Rejected', set the response date
OfferSchema.pre('save', function(next) {
  if (this.isModified('status') && (this.status === 'Accepted' || this.status === 'Rejected')) {
    this.responseDate = Date.now();
  }
  next();
});

module.exports = mongoose.model('Offer', OfferSchema);
