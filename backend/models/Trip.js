const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  budget: {
    type: Number,
    default: 0
  },
  photoUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
