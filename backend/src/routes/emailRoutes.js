// backend/src/routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure upload directory
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Create local multer instance for this route
const upload = multer({ dest: uploadDir });

// --- ROUTES ---

// Production webhook (SendGrid/Mailgun style)
router.post('/inbound', upload.any(), emailController.inboundWebhook);

// Manual inbound for testing
router.post('/manual', emailController.manualInbound);

module.exports = router;
