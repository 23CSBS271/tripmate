const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not a Google user
    }
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
