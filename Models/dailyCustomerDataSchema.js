// models/DailyCustomerData.js
const mongoose = require('mongoose');

const { Schema } = mongoose;

const ExtraPartSchema = new Schema({
  used: { type: Boolean, required: true, default: false },
  source: { type: String, enum: ['stock', 'outside', null], default: null }, // 'stock' | 'outside' | null
  // stockItemId: { type: Schema.Types.ObjectId, ref: 'StockItem', default: null },
  stockItemId: { type: String, default: null },   // keep as String for flexible IDs; change to ObjectId + ref if desired
  // outsideShopId: { type: Schema.Types.ObjectId, ref: 'OutsideShop', default: null },
  outsideShopId: { type: String, default: null },
  partCost: { type: Number, default: 0 },         // cost of the extra part
}, { _id: false });

const GuaranteeSchema = new Schema({
  eligible: { type: Boolean, default: false },   // whether this problem is eligible for guarantee (screen/battery logic)
  included: { type: Boolean, required: true, default: false },
  duration: { type: String, default: null },     // e.g., "3 Months", "6 Months", "12 Months"
  amount: { type: Number, default: 0 },          // guarantee fee charged
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
}, { _id: false });

const AmountsSchema = new Schema({
  baseAmount: { type: Number, default: 0 },      // merged service + parts for this problem
  collectedTotal: { type: Number, default: 0 },  // baseAmount + guaranteeFee (per-problem collected)
}, { _id: false });

const ProblemSchema = new Schema({
  IdProvidedWhileCreatingData: {type: String, required: true},
  workPart: { type: String, required: true },           // e.g., "SCREEN", "BATTERY", etc.
  problemDescription: { type: String, required: true }, // human-readable description
  partRepaired: { type: String, default: "" },          // what was repaired (optional)
  extraPart: { type: ExtraPartSchema, default: () => ({}) },
  guarantee: { type: GuaranteeSchema, default: () => ({}) },
  amounts: { type: AmountsSchema, default: () => ({}) },
  // keep client-side id for debugging if present (not required)
  // clientProblemId: { type: String, default: null },
}, { _id: true });

const DailyCustomerDataSchema = new Schema({
  isGuaranteeService: {type: Boolean, required:true,},
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  device: {
    brand: { type: String, required: true, trim: true },
    modelNo: { type: String, required: true, trim: true },
  },
  problems: {
    type: [ProblemSchema],
    default: undefined, // ensure it's absent when not provided, but typical use will supply an array
    validate: {
      validator: function (v) {
        // ensure at least one problem exists
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one problem is required.'
    }
  },
  summary: {
    baseTotalCollectedORServiceCharge: { type: Number, default: 0 , required:true},
    netTotalCollected: { type: Number, default: 0 , required:true},
    // totalPartsCost: { type: Number, default: 0, required:true },
    // profit: { type: Number, default: 0 , required:true},
    totalPartsCost: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
  },
  meta: {
    enteredBy: { type: String, required: true },      // staff name
    staffEmail: { type: String, default: "" },
    //  staffId: { type: Schema.Types.ObjectId, ref: 'StaffInfo', default: null },
    staffId: { type: String, default: null },         // use String for flexibility; change to ObjectId + ref if desired
    // branchId: { type: String, default: null },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    branchName: { type: String, default: "" },
    branchManagerName: { type: String, default: null },
    branchManagerEmail: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now },
  }
}, {
  timestamps: true, // adds createdAt and updatedAt
  strict: true,
});

module.exports = mongoose.model('DailyCustomerData', DailyCustomerDataSchema);
