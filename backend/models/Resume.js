const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResumeSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  template: {
    type: String,
    required: true,
    default: 'classic',
  },
  data: {
    personalInfo: Object,
    academicDetails: Array,
    skills: Array,
    projects: Array,
    certifications: Array,
    careerObjective: String,
  },
  version: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);