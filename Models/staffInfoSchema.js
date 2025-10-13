const mongoose = require('mongoose');

const staffInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true }, // Should be hashed before saving
  role: { type: String, enum: ['staff'], required: true },
  branchName: { type: String, required: true},
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  salaryPercentage: { type: Number, required: true },
  safetyAdvance: { type: Number, default: 0 },
  investmentAmount: { type: Number, default: 0 },
  nidNumber: { type: String, },
  homeAddress: { type: String,  },
  location: { type: String,  },
  emergencyContact: {
    name: { type: String, },
    relation: { type: String, },
    phone: { type: String, }
  },
  note: { type: String },
  joinDate: { type: Date }
});

module.exports = mongoose.model('StaffInfo', staffInfoSchema);