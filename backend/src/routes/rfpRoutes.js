// backend/src/routes/rfpRoutes.js
const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfpController');

// Create RFP from natural-language text
router.post('/from-text', rfpController.createFromText);

// List all RFPs
router.get('/', rfpController.listRfps);

// Get single RFP by id
router.get('/:id', rfpController.getRfpById);

// Send RFP to vendors
router.post('/:id/send', rfpController.sendRfp);

// Compare proposals for an RFP
router.get('/:id/compare', rfpController.compareRfpProposals);

module.exports = router;
