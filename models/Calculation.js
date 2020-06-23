const mongoose = require('mongoose');

const calculationSchema = new mongoose.Schema({
  image: {
    type: String,
    default: null
  }, 
  timestamps: true
});

module.exports = mongoose.model('Calculation', calculationSchema);
