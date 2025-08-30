const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  company: {
    type: Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Internship', 'Part-time', 'Contract'],
    default: 'Full-time'
  },
  positions: {
    type: Number,
    required: true,
    default: 1
  },
  eligibilityCriteria: {
    branches: [String],
    minCGPA: {
      type: Number,
      default: 0
    },
    graduationYear: Number,
    otherRequirements: String
  },
  package: {
    baseSalary: Number,
    bonuses: Number,
    stockOptions: Number,
    benefits: String,
    totalCTC: {
      type: Number,
      required: true
    }
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  selectionProcess: {
    rounds: [{
      name: String,
      description: String
    }]
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Filled', 'Cancelled'],
    default: 'Open'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  attachments: [
    {
      name: String,
      url: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);
