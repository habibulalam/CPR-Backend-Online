const mongoose = require('mongoose');

const dummySchema = new mongoose.Schema({
  name: String,
  value: Number
});

module.exports = mongoose.model('Dummy', dummySchema);