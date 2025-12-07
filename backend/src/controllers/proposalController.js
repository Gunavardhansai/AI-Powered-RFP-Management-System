const prisma = require('../lib/prismaClient');
const scoring = require('../services/scoring');
const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');

exports.listByRfp = async (req, res) => {
  const rfpId = req.params.rfpId;
  const proposals = await prisma.proposal.findMany({ where: { rfpId }, include: { vendor: true }});
  res.json({ success: true, data: proposals });
};

exports.getProposal = async (req, res) => {
  const id = req.params.id;
  const p = await prisma.proposal.findUnique({ where: { id }, include: { vendor: true, attachments: true, items: true }});
  if (!p) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: p });
};

exports.recomputeScore = async (req, res) => {
  const id = req.params.id;
  const p = await prisma.proposal.findUnique({ where: { id }, include: { rfp: true }});
  if (!p) return res.status(404).json({ success: false, error: 'Not found' });
  const computed = scoring.computeScoreFromProposalAndRfp(p, p.rfp);
  await prisma.proposal.update({ where: { id }, data: { score: computed.score, recommendation: computed.reason }});
  res.json({ success: true, data: computed });
};

exports.uploadAttachment = async (req, res) => {
  const id = req.params.id;
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, error: 'No file' });

  // move file info into DB
  const attach = await prisma.attachment.create({
    data: {
      proposalId: id,
      filename: file.originalname || file.filename,
      path: file.path,
      contentType: file.mimetype,
      size: file.size
    }
  });

  // attempt to extract text and parse into proposal fields if needed
  try {
    const text = await pdfService.extractTextFromFile(file.path);
    // naive: just append to raw email
    const prop = await prisma.proposal.update({
      where: { id },
      data: { raw_email: ('' + (prop?.raw_email || '')) + '\n\n' + text }
    });
  } catch (e) {
    console.error('attachment parse err', e);
  }

  res.json({ success: true, data: attach });
};

exports.updateProposal = async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    const updated = await prisma.proposal.update({ where: { id }, data });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
