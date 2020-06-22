const mongoose = require('mongoose');

const calculationSchema = new mongoose.Schema({
  image: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Calculation', calculationSchema);
