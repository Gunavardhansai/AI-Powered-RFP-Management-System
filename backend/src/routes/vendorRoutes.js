// backend/src/routes/vendorRoutes.js
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

// List vendors
router.get('/', vendorController.listVendors);

// Create vendor
router.post('/', vendorController.createVendor);

module.exports = router;
