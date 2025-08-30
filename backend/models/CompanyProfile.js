const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanyProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  website: String,
  description: String,
  industry: String,
  location: String,
  companySize: String,
  establishedYear: Number,
  logo: String,
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanyProfile', CompanyProfileSchema);