require('dotenv').config(); // Import dotenv to load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Branch = require('./Models/branchSchema');
const ManagerInfo = require('./Models/managerInfoSchema');
const StaffInfo = require('./Models/staffInfoSchema');
const AdminInfo = require('./Models/adminInfoSchema');
const DailyCustomerData = require('./Models/dailyCustomerDataSchema');
const Guarantee = require('./Models/guarantee');


const app = express();
// app.use(cors({ origin: 'https://yourdomain.com' }));
app.use(cors());
app.use(express.json());


// Connecting to db
const connectDB = async () => {
  try {
    // Local DB
    await mongoose.connect("mongodb://127.0.0.1:27017/CprBusinessManagement");
    console.log("Database is connected to Local Database");

    // Online DD
    // await mongoose.connect(process.env.MONGO_URI);
    // console.log("Database is connected to Online Database");

  } catch (error) {
    console.log("Database is not Connected");
    console.log(error.message);
    process.exit(1);
  }
};

app.get("/", async (req, res) => {
  res.status(200).send("Code is running")
})

// ------------------------------------------------------- Login Related Code Start------------------------------------------
// POST API to check login credentials
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, role, branchId } = req.body;
    let user = null;

    if (role === 'admin') {
      user = await AdminInfo.findOne({ email, password });
    } else if (role === 'manager') {
      user = await ManagerInfo.findOne({ email, password, branchId });
    } else if (role === 'staff') {
      user = await StaffInfo.findOne({ email, password, branchId });
    } else {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Only send selected fields
    const filteredUser = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      branchName: user.branchName,
      branchId: user.branchId
    };

    res.status(200).json({ message: 'Login successful', user: filteredUser });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});
// ------------------------------------------------------- Login Related Code End---------------------------------------------

// -------------------------------------------------------Branch Related Code Start---------------------------------------------------
// GET route to fetch all branches
app.get('/api/branches', async (req, res) => {
  try {
    const branches = await Branch.find();
    res.status(200).json(branches);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching branches', error: error.message });
  }
});

// POST route to create a new branch
app.post('/api/branches', async (req, res) => {
  try {
    const { branchName, branchLocation } = req.body;
    const newBranch = new Branch({ branchName, branchLocation });
    const savedBranch = await newBranch.save();
    res.status(201).json({ message: 'Branch created', data: savedBranch });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: 'Error creating branch', error: error.message });
  }
});
// -------------------------------------------------------Branch Related Code END---------------------------------------------------


// ---------------------------------------------Save/Get Admin, Manager, Staff Info related Code STart----------------------------------
// POST API to save staff or manager info
app.post('/api/saveStaffOrManagerInfo', async (req, res) => {
  try {
    const { role, email } = req.body;
    // console.log(req.body);
    let savedData;

    // Check if email already exists in any collection
    const emailExistsInManager = await ManagerInfo.findOne({ email });
    const emailExistsInStaff = await StaffInfo.findOne({ email });
    const emailExistsInAdmin = await AdminInfo.findOne({ email });

    if (emailExistsInManager || emailExistsInStaff || emailExistsInAdmin) {
      return res.status(400).json({ message: 'Email already exists. Try another Email' });
    }

    if (role === 'manager') {
      const manager = new ManagerInfo(req.body);
      savedData = await manager.save();
    } else if (role === 'staff') {
      const staff = new StaffInfo(req.body);
      savedData = await staff.save();
    } else if (role === 'admin') {
      const admin = new AdminInfo(req.body);
      savedData = await admin.save();
    } else {
      return res.status(400).json({ message: 'Invalid role. Must be "manager", "staff", or "admin".' });
    }

    res.status(201).json({ message: `${role} info saved`, data: savedData });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: 'Error saving info', error: error.message });
  }
});

// GET API to fetch all staff info
app.get('/api/staff', async (req, res) => {
  try {
    const staffList = await StaffInfo.find({}, { password: 0 }); // Exclude password
    res.status(200).json(staffList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff info', error: error.message });
  }
});
// GET API to fetch a single staff by ID
app.get('/api/staff/:id', async (req, res) => {
  try {
    const staff = await StaffInfo.findById(req.params.id);
    // console.log(staff);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff info', error: error.message });
  }
});

// PUT API to update a staff by ID
app.put('/api/staff/:id', async (req, res) => {
  try {
    const updatedStaff = await StaffInfo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json({ message: 'Staff updated', data: updatedStaff });
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff info', error: error.message });
  }
});

// DELETE API to remove a staff by ID
app.delete('/api/staff/:id', async (req, res) => {
  try {
    const deletedStaff = await StaffInfo.findByIdAndDelete(req.params.id);
    if (!deletedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json({ message: 'Staff deleted', data: deletedStaff });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff info', error: error.message });
  }
});

// GET API to fetch all manager info
app.get('/api/manager', async (req, res) => {
  try {
    const managerList = await ManagerInfo.find();
    res.status(200).json(managerList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching manager info', error: error.message });
  }
});
// GET API to fetch a single manager by ID
app.get('/api/manager/:id', async (req, res) => {
  try {
    const manager = await ManagerInfo.findById(req.params.id);
    // console.log(manager);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    res.status(200).json(manager);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching manager info', error: error.message });
  }
});

// PUT API to update a manager by ID
app.put('/api/manager/:id', async (req, res) => {
  try {
    const updatedManager = await ManagerInfo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedManager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    res.status(200).json({ message: 'Manager updated', data: updatedManager });
  } catch (error) {
    res.status(500).json({ message: 'Error updating manager info', error: error.message });
  }
});

// DELETE API to remove a manager by ID
app.delete('/api/manager/:id', async (req, res) => {
  try {
    const deletedManager = await ManagerInfo.findByIdAndDelete(req.params.id);
    if (!deletedManager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    res.status(200).json({ message: 'Manager deleted', data: deletedManager });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting manager info', error: error.message });
  }
});

// GET API to fetch all admin info
app.get('/api/admin', async (req, res) => {
  try {
    const adminList = await AdminInfo.find();
    res.status(200).json(adminList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin info', error: error.message });
  }
});

// GET API to fetch a single admin by ID
app.get('/api/admin/:id', async (req, res) => {
  try {
    const admin = await AdminInfo.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin info', error: error.message });
  }
});

// PUT API to update an admin by ID
app.put('/api/admin/:id', async (req, res) => {
  try {
    const updatedAdmin = await AdminInfo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ message: 'Admin updated', data: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin info', error: error.message });
  }
});

// DELETE API to remove an admin by ID
app.delete('/api/admin/:id', async (req, res) => {
  try {
    const deletedAdmin = await AdminInfo.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ message: 'Admin deleted', data: deletedAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin info', error: error.message });
  }
});
// ---------------------------------------------Save/Get Admin, Manager, Staff Info related Code END---------------------------------

// ============================================= Customer Info ADD,Find,Delete,Update related code Start=============================

// POST API to save daily customer data
app.post('/api/daily-customer-data', async (req, res) => {
  try {
    const dailyData = new DailyCustomerData(req.body);
    // console.log(dailyData);
    const savedData = await dailyData.save();
    // console.log(savedData);
    res.status(200).json({ message: 'Daily customer data saved', data: savedData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error saving daily customer data', error: error.message });
  }
});

// GET /api/daily-customer-data/:id
app.get('/api/daily-customer-data/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const doc = await DailyCustomerData.findById(id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('GET single error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/daily-customer-data/:id
app.put('/api/daily-customer-data/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const payload = req.body;
    // Optionally recompute summary if problems changed
    if (Array.isArray(payload.problems)) {
      let baseTotalCollectedORServiceCharge = 0;
      let netTotalCollected = 0;
      let totalPartsCost = 0;

      payload.problems.forEach((p) => {
        const base = Number(p.amounts?.baseAmount || p.baseAmount || 0);
        const guarantee = Number(p.guarantee?.amount || p.guaranteeAmount || 0);
        baseTotalCollectedORServiceCharge += base;
        netTotalCollected += base + guarantee;
        if (p.extraPart?.used) totalPartsCost += Number(p.extraPart?.partCost || 0);
      });

      const profit = netTotalCollected - totalPartsCost;
      payload.summary = {
        baseTotalCollectedORServiceCharge,
        netTotalCollected,
        totalPartsCost,
        profit
      };
    }

    const updated = await DailyCustomerData.findByIdAndUpdate(
      id,
      payload,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json(updated);
  } catch (err) {
    console.error('PUT update error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ================================================ Get Daily Customer Data For today only from Manager Start====================================

// GET /api/daily-customer-data/today
// Bangladesh offset fixed: UTC+6 (no DST)
const BD_OFFSET_MS = 6 * 60 * 60 * 1000;

// GET /api/get-daily-customer-data-from-manager?branchId=<id>
app.post('/api/get-daily-customer-data-from-manager', async (req, res) => {
  try {
    const { branchId } = req.body;
    if (!branchId) {
      return res.status(400).json({ message: 'branchId is required in request body' });
    }

    // 1) BD "now" by shifting current UTC time by BD offset
    const bdNow = new Date(Date.now() + BD_OFFSET_MS);

    // 2) Extract BD local year, month, date using UTC getters on bdNow
    const year = bdNow.getUTCFullYear();
    const month = bdNow.getUTCMonth(); // 0-based
    const day = bdNow.getUTCDate();

    // 3) Build BD local midnight and BD local end-of-day as UTC milliseconds, then convert back to Date
    const startUtcMs = Date.UTC(year, month, day, 0, 0, 0, 0) - BD_OFFSET_MS;
    const endUtcMs = Date.UTC(year, month, day, 23, 59, 59, 999) - BD_OFFSET_MS;

    const start = new Date(startUtcMs);
    const end = new Date(endUtcMs);

    // Build a branch filter that is tolerant of string or ObjectId stored values
    let branchObjectId = null;
    try {
      branchObjectId = mongoose.Types.ObjectId(branchId);
    } catch (e) {
      branchObjectId = null;
    }
    // console.log(branchObjectId);

    const branchFilter = branchObjectId
      ? {
        $or: [
          { 'meta.branchId': branchObjectId },
          { 'meta.branchId': String(branchId) },
          { branchId: branchObjectId },
          { branchId: String(branchId) }
        ]
      }
      : {
        $or: [
          { 'meta.branchId': String(branchId) },
          { branchId: String(branchId) }
        ]
      };
    // console.log(branchFilter);

    // Time filter tolerant to meta.createdAt or top-level createdAt
    const timeFilter = {
      $or: [
        { 'meta.createdAt': { $gte: start, $lte: end } },
        { createdAt: { $gte: start, $lte: end } }
      ]
    };
    // console.log(timeFilter);

    // Final query: AND(branchFilter, timeFilter)
    const query = { $and: [branchFilter, timeFilter] };

    const docs = await DailyCustomerData.find(query)
      .sort({ 'meta.createdAt': -1, createdAt: -1 })
      .lean();

    return res.json(docs);
  } catch (err) {
    console.error('GET today (POST body) error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// ================================================ Get Daily Customer Data For today only from Manager (End)====================================
// 



// ============================================= Customer Info ADD,Find,Delete,Update related code End=============================

// ============================================= Save Guarantee data from Staff/Manager (Start)=====================================
app.post('/api/guarantees', async (req, res) => {
  try {
    const arr = Array.isArray(req.body.guarantees) ? req.body.guarantees : null;
    // console.log(arr);
    if (!arr || arr.length === 0) {
      return res.status(400).json({ message: 'No guarantees provided' });
    }

    // Normalize/validate items minimally before insert
    const toInsert = arr.map((g) => {
      // console.log(g.IdProvidedWhileCreatingData);
      const guaranteeStart = g.guarantee?.startDate ? new Date(g.guarantee.startDate) : null;
      const guaranteeEnd = g.guarantee?.endDate ? new Date(g.guarantee.endDate) : null;

      return {
        IdProvidedWhileCreatingData: g.IdProvidedWhileCreatingData,
        dailyCustomerDataId: g.dailyCustomerDataId || null,
        isActive: g.isActive,     // Active when creating
        customer: g.customer || {},
        device: g.device || {},
        problem: g.problem || {},
        guarantee: {
          duration: g.guarantee?.duration || null,
          amount: Number(g.guarantee?.amount) || 0,
          startDate: guaranteeStart,
          endDate: guaranteeEnd,
        },
        part: {
          used: !!g.part?.used,
          source: g.part?.source || null,
          stockItemId: g.part?.stockItemId || null,
          outsideShopId: g.part?.outsideShopId || null,
          partCost: Number(g.part?.partCost) || 0,
        },
        meta: {
          enteredBy: g.meta?.enteredBy || null,
          staffEmail: g.meta?.staffEmail || null,
          staffId: g.meta?.staffId || null,
          branchId: g.meta?.branchId || null,
          branchName: g.meta?.branchName || null,
          branchManagerName: g.meta?.branchManagerName || null,
          branchManagerEmail: g.meta?.branchManagerEmail || null,
          issuedAt: g.meta?.issuedAt ? new Date(g.meta.issuedAt) : new Date(),
          createdAt: new Date(),
        },
      };
    });

    const created = await Guarantee.insertMany(toInsert);
    // console.log(created);
    return res.json({ insertedCount: created.length, docs: created });
  } catch (err) {
    console.error('POST guarantees error', err);
    return res.status(500).json({ message: 'Server error saving guarantees' });
  }
});

// ============================================= Save Guarantee data from Staff/Manager (End)=====================================

// ============================================= Modify Guarantee data from Staff/Manager (Start)=====================================
// ============================================= Modify Guarantee data from Staff/Manager (Start)=====================================
// PUT /api/guarantees/:id
// Update guarantee by id (for dailyCustomer info not Gurantee service update means not for deactivating guarantee)
// PUT /api/guarantees/:dailyCustomerDataId
app.put('/api/guarantees/:dailyCustomerDataId', async (req, res) => {
  try {
    const { dailyCustomerDataId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(dailyCustomerDataId)) {
      return res.status(400).json({ message: 'Invalid dailyCustomerDataId' });
    }

    // 1. Delete all guarantees with this dailyCustomerDataId
    await Guarantee.deleteMany({ dailyCustomerDataId });

    // 2. Insert new guarantees from req.body (can be array or single object)
    let newGuarantees = req.body.guarantees;
    if (!Array.isArray(newGuarantees)) newGuarantees = [newGuarantees];

    // Ensure each new guarantee has the correct dailyCustomerDataId
    newGuarantees = newGuarantees.map(g => ({
      ...g,
      dailyCustomerDataId
    }));
    // console.log("Ready Data:", newGuarantees);

    const inserted = await Guarantee.insertMany(newGuarantees);
    // console.log(inserted);

    return res.json({ message: 'Guarantees replaced', insertedCount: inserted.length, data: inserted });
  } catch (err) {
    console.error('PUT /api/guarantees/:dailyCustomerDataId error', err);
    return res.status(500).json({ message: 'Server error replacing guarantees' });
  }
});

// Delete guarantee by id
app.delete('/api/guarantees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid guarantee id' });

    const removed = await Guarantee.findByIdAndDelete(id).lean();
    if (!removed) return res.status(404).json({ message: 'Guarantee not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/guarantees/:id error', err);
    return res.status(500).json({ message: 'Server error deleting guarantee' });
  }
});

// ============================================= Modify Guarantee data from Staff/Manager (End)=====================================
// ============================================= Modify Guarantee data from Staff/Manager (End)=====================================


// ============================================= Get Guarantee data with the Query params(Search with name phone brand) (Starts)=====================================
app.get('/api/guarantees', async (req, res) => {
  try {
    const { search, from, to } = req.query;

    // Build query object
    const query = {};

    // If search is provided, match against customer.name, customer.phone, device.brand
    if (search) {
      const regex = new RegExp(search, 'i'); // case-insensitive
      query.$or = [
        { 'customer.name': regex },
        { 'customer.phone': regex },
        { 'device.brand': regex },
      ];
    }

    // If date range is provided, filter by guarantee.startDate
    if (from || to) {
      query['guarantee.startDate'] = {};
      if (from) query['guarantee.startDate'].$gte = new Date(from);
      if (to) query['guarantee.startDate'].$lte = new Date(to);
    }

    const guarantees = await Guarantee.find(query).sort({ 'guarantee.startDate': -1 });

    return res.json(guarantees);
  } catch (err) {
    console.error('GET guarantees error', err);
    return res.status(500).json({ message: 'Server error fetching guarantees' });
  }
});

// ============================================= Get Guarantee data with the Query params (End)=====================================
// ============================================= Get Guarantee Data By ID (Start)=====================================
// GET /api/guarantees/:id
app.get('/api/guarantees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid guarantee id' });
    }

    const guarantee = await Guarantee.findById(id);
    if (!guarantee) {
      return res.status(404).json({ message: 'Guarantee not found' });
    }
    return res.json(guarantee);
  } catch (err) {
    console.error('GET /api/guarantees/:id error', err);
    return res.status(500).json({ message: 'Server error fetching guarantee' });
  }
});
// ============================================= Get Guarantee Data By ID (End)=====================================
// ============================================= Put guarantee only for DEACTIVATING guarantee (Start)=====================================
// PUT /api/deactiveGuarantee/:id
app.put('/api/deactivateGuarantee/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid guarantee id' });
    }

    // Only update isActive field
    const updated = await Guarantee.findByIdAndUpdate(
      id,
      { isActive: false, 'meta.updatedAt': new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Guarantee not found' });
    }
    return res.json({ message: 'Guarantee deactivated', data: updated });
  } catch (err) {
    console.error('PUT /api/deactiveGuarantee/:id error', err);
    return res.status(500).json({ message: 'Server error deactivating guarantee' });
  }
});
// ============================================= Put guarantee only for DEACTIVATING guarantee (End)=======================================


// =============================================
// Daily Final Report (Manager) - STAFF FIXED
// =============================================

const BD_OFFSET_MS_2 = 6 * 60 * 60 * 1000;

app.post('/api/daily-final-report/fetch', async (req, res) => {
  try {
    const {
      managerId,
      managerEmail,
      branchId,
      branchName,
      dateInfo
    } = req.body;

    if (!branchId || !dateInfo?.date) {
      return res.status(400).json({ message: 'branchId and dateInfo.date are required' });
    }

    // ------------------------------------------------
    // 1) Build Bangladesh day range (SAFE)
    // ------------------------------------------------
    const [year, month, day] = dateInfo.date.split('-').map(Number);

    const startUtcMs =
      Date.UTC(year, month - 1, day, 0, 0, 0, 0) - BD_OFFSET_MS_2;

    const endUtcMs =
      Date.UTC(year, month - 1, day, 23, 59, 59, 999) - BD_OFFSET_MS_2;

    const start = new Date(startUtcMs);
    const end = new Date(endUtcMs);

    // ------------------------------------------------
    // 2) Branch filter (ObjectId + string safe)
    // ------------------------------------------------
    let branchObjectId = null;
    try {
      branchObjectId = mongoose.Types.ObjectId(branchId);
    } catch (_) {}

    const branchFilter = branchObjectId
      ? {
          $or: [
            { 'meta.branchId': branchObjectId },
            { 'meta.branchId': String(branchId) },
            { branchId: branchObjectId },
            { branchId: String(branchId) }
          ]
        }
      : {
          $or: [
            { 'meta.branchId': String(branchId) },
            { branchId: String(branchId) }
          ]
        };

    // ------------------------------------------------
    // 3) Fetch DailyCustomerData
    // ------------------------------------------------
    const dailyDocs = await DailyCustomerData.find({
      $and: [
        branchFilter,
        {
          $or: [
            { 'meta.createdAt': { $gte: start, $lte: end } },
            { createdAt: { $gte: start, $lte: end } }
          ]
        }
      ]
    }).lean();

    // ------------------------------------------------
    // 4) Aggregation (STAFF BASIC DATA ONLY)
    // ------------------------------------------------
    const staffMap = {};
    const machineMap = {};
    const brandMap = {};
    let totalExpenses = 0;
    let partsIncome = 0;

    dailyDocs.forEach(doc => {
      // -------- STAFF SUMMARY (NO NAME, NO SALARY HERE)
      const staffId = doc.meta?.staffId;
      if (staffId) {
        const key = String(staffId);

        if (!staffMap[key]) {
          staffMap[key] = {
            staffId: key,
            totalCustomers: 0,
            totalEarnings: 0,
            salaryPercent: 0,
            salaryAmount: 0,
            netPay: 0,
            name: 'Unknown'
          };
        }

        staffMap[key].totalCustomers += 1;
        staffMap[key].totalEarnings += doc.summary?.netTotalCollected || 0;
      }

      // -------- MACHINE / SERVICE (unchanged)
      doc.problems?.forEach(p => {
        const name = p.workPart || 'Unknown Service';
        if (!machineMap[name]) {
          machineMap[name] = { name, count: 0, totalAmount: 0 };
        }
        machineMap[name].count += 1;
        machineMap[name].totalAmount += p.amounts?.baseAmount || 0;

        if (p.extraPart?.used) {
          partsIncome += Number(p.extraPart.partCost || 0);
        }
      });

      // -------- BRAND COUNT
      const brand = doc.device?.brand;
      if (brand) {
        brandMap[brand] = (brandMap[brand] || 0) + 1;
      }

      // -------- EXPENSES
      if (Array.isArray(doc.expenses)) {
        doc.expenses.forEach(e => {
          totalExpenses += Number(e.amount || 0);
        });
      }
    });

    // ------------------------------------------------
    // 5) FETCH STAFF INFOS USING staffIds
    // ------------------------------------------------
    const staffIds = Object.keys(staffMap);

    const staffInfos = await StaffInfo.find({
      _id: { $in: staffIds }
    }).lean();

    // ------------------------------------------------
    // 6) Build staffInfo lookup map
    // ------------------------------------------------
    const staffInfoMap = {};
    staffInfos.forEach(s => {
      staffInfoMap[String(s._id)] = {
        name: s.name,
        salaryPercentage: s.salaryPercentage || 0
      };
    });

    // ------------------------------------------------
    // 7) Merge staffInfos + Salary Calculation
    // ------------------------------------------------
    const staff = Object.values(staffMap).map(s => {
      const info = staffInfoMap[s.staffId];

      s.name = info?.name || 'Unknown';
      s.salaryPercent = info?.salaryPercentage || 0;

      s.salaryAmount = Math.round(
        (s.totalEarnings * s.salaryPercent) / 100
      );

      s.netPay = s.totalEarnings - s.salaryAmount;
      return s;
    });

    // ------------------------------------------------
    // 8) Guarantee summary (unchanged)
    // ------------------------------------------------
    const guarantees = await Guarantee.find({
      'meta.branchId': String(branchId),
      'meta.createdAt': { $gte: start, $lte: end }
    }).lean();

    let guaranteeTotal = 0;
    let demurrageTotal = 0;

    guarantees.forEach(g => {
      guaranteeTotal += Number(g.guarantee?.amount || 0);
      if (!g.isActive) {
        demurrageTotal += Number(g.guarantee?.amount || 0);
      }
    });

    // ------------------------------------------------
    // 9) Final totals
    // ------------------------------------------------
    const totalStaffEarnings = staff.reduce((a, s) => a + s.totalEarnings, 0);
    const totalMachineIncome = Object.values(machineMap)
      .reduce((a, m) => a + m.totalAmount, 0);

    const netIncome =
      totalStaffEarnings +
      totalMachineIncome +
      partsIncome -
      (totalExpenses + demurrageTotal);

    // ------------------------------------------------
    // 10) Final response
    // ------------------------------------------------
    return res.json({
      meta: {
        date: dateInfo.date,
        managerId,
        managerEmail,
        branchId,
        branchName
      },
      staff,
      machines: Object.values(machineMap),
      expenses: [],
      guarantee: {
        guaranteeTotal,
        demurrageTotal
      },
      brands: Object.entries(brandMap).map(([brand, count]) => ({
        brand,
        count
      })),
      totals: {
        totalStaffEarnings,
        totalMachineIncome,
        totalExpenses,
        partsIncome,
        netIncome
      }
    });

  } catch (err) {
    console.error('Daily final report error:', err);
    return res.status(500).json({ message: 'Server error generating report' });
  }
});




// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, async () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}`);
  await connectDB();
});