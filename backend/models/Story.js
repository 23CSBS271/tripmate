const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  coverImage: {
    type: String,
    default: null
  },
  photos: {
    type: [Object],
    default: []
  },
  location: {
    type: String,
    default: null
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null
  },
  excerpt: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Story', storySchema);
