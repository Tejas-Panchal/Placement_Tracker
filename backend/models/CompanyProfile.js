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
});

module.exports = mongoose.model('CompanyProfile', CompanyProfileSchema);