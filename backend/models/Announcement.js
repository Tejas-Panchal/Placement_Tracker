const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnnouncementSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  targetAudience: {
    type: [String],
    enum: ['student', 'company', 'tpo', 'all'],
    default: ['all']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attachments: [
    {
      name: String,
      url: String
    }
  ]
});

AnnouncementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
