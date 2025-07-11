const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  password: { type: String }, 
  devices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
