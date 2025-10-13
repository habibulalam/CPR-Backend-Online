// models/Guarantee.js
const mongoose = require('mongoose');

const GuaranteeSchema = new mongoose.Schema({
  // _id: {type: mongoose.Schema.Types.ObjectId },
  IdProvidedWhileCreatingData: {type: String, required: true},
  dailyCustomerDataId: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyCustomerData', required: false },
  isActive: {type: Boolean, default: false, required: true},
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },
  device: {
    brand: { type: String, required: true },
    modelNo: { type: String, required: true },
  },
  problem: {
    workPart: { type: String },
    problemDescription: { type: String },
    partRepaired: { type: String },
  },
  guarantee: {
    duration: { type: String }, // e.g., "3 Months", "12 Months"
    amount: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  part: {
    used: { type: Boolean, default: false },
    source: { type: String, enum: ['stock', 'outside', null], default: null },
    // stockItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItem', default: null },
    stockItemId: { type: String, default: null },
    // outsideShopId: { type: mongoose.Schema.Types.ObjectId, ref: 'OutsideShop', default: null },
    outsideShopId: { type: String, default: null },
    partCost: { type: Number, default: 0 },
  },
  meta: {
    enteredBy: { type: String },
    staffEmail: { type: String },
    // staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffInfo', default: null },
    staffId: { type: String },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
    // branchId: { type: String },
    branchName: { type: String },
    branchManagerName: { type: String },
    branchManagerEmail: { type: String },
    issuedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
  },
});

module.exports = mongoose.model('Guarantee', GuaranteeSchema);
