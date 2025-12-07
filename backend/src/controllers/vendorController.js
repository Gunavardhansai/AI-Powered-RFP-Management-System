// backend/src/controllers/vendorController.js

// Use PrismaClient directly here to avoid any import confusion
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/vendors
exports.listVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: vendors });
  } catch (err) {
    console.error('listVendors error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/vendors
exports.createVendor = async (req, res) => {
  try {
    const { name, email, contact, notes } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, error: 'name and email are required' });
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        contact: contact || null,
        notes: notes || null,
      },
    });

    res.json({ success: true, data: vendor });
  } catch (err) {
    console.error('createVendor error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
