const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { logger } = require('./lib/logger');
const rfpRoutes = require('./routes/rfpRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const emailRoutes = require('./routes/emailRoutes');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
const upload = multer({ dest: uploadDir });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/emails', emailRoutes);

// simple health
app.get('/health', (req, res) => res.json({ ok: true }));

module.exports = { app, upload };
