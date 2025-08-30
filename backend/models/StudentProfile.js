const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  personalInfo: {
    dob: Date,
    contact: String,
    address: String,
  },
  academicDetails: [{
    degree: String,
    branch: String,
    cgpa: Number,
    passingYear: Number,
  }],
  skills: [String],
  projects: [{
    title: String,
    description: String,
    link: String,
  }],
  certifications: [{
    name: String,
    authority: String,
    link: String,
  }],
  placementStatus: {
    type: String,
    enum: ['Not Placed', 'Placed'],
    default: 'Not Placed',
  },
  offers: [{
    type: Schema.Types.ObjectId,
    ref: 'Offer',
  }],
  upgradesUsed: {
    type: Number,
    default: 0,
    max: 2,
  },
});

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);