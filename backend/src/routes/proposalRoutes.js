const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const path = require('path');
const multer = require('multer');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

router.get('/rfp/:rfpId', proposalController.listByRfp);
router.get('/:id', proposalController.getProposal);
router.post('/:id/score', proposalController.recomputeScore);
router.put('/:id', proposalController.updateProposal);


// Accept file upload to simulate inbound email attachment
router.post('/:id/upload-attachment', upload.single('file'), proposalController.uploadAttachment);

module.exports = router;
