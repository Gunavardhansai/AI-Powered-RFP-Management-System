const prisma = require('../lib/prismaClient');
const aiService = require('../services/aiService');
const scoring = require('../services/scoring');
const fs = require('fs');
const path = require('path');
const { logger } = require('../lib/logger');

exports.inboundWebhook = async (req, res) => {
  // Expect fields: from, to, subject, text
  try {
    const body = req.body;
    const files = req.files || [];
    const from = body.from || body.email || '';
    const to = body.to || '';
    const subject = body.subject || '';
    const text = body.text || body.plain || '';

    // save email log
    const log = await prisma.emailLog.create({
      data: {
        type: 'inbound',
        to,
        from,
        subject,
        body: text
      }
    });

    // find RFP by RFP_REF token in subject
    const match = subject.match(/RFP_REF=([a-zA-Z0-9\-_]+)/);
    let rfp;
    if (match) rfp = await prisma.rFP.findUnique({ where: { id: match[1] }});

    // try to find vendor by from email
    const vendor = await prisma.vendor.findFirst({ where: { email: from }});

    // create proposal record
    const parsed = await aiService.parseVendorResponse({ text, attachments: files });

    const proposal = await prisma.proposal.create({
      data: {
        rfpId: rfp ? rfp.id : null,
        vendorId: vendor ? vendor.id : null,
        raw_email: text,
        parsed_json: parsed,
        total_price: parsed.total_price ?? null,
        currency: parsed.currency ?? null,
        delivery_days: parsed.delivery_days ?? null,
        payment_terms: parsed.payment_terms ?? null,
        warranty_months: parsed.warranty_months ?? null
      }
    });

    // compute score
    let scoreObj = {};
    if (rfp) {
      scoreObj = scoring.computeScoreFromProposalAndRfp({ ...proposal, parsed_json: parsed }, rfp);
      await prisma.proposal.update({ where: { id: proposal.id }, data: { score: scoreObj.score, recommendation: scoreObj.reason }});
    }

    res.json({ success: true, data: { proposalId: proposal.id, parsed, scoreObj }});
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.manualInbound = async (req, res) => {
  // manual text + rfpId + vendorId to simulate inbound
  try {
    const { rfpId, vendorId, text } = req.body;
    const parsed = await aiService.parseVendorResponse({ text, attachments: [] });
    const proposal = await prisma.proposal.create({
      data: {
        rfpId: rfpId || null,
        vendorId: vendorId || null,
        raw_email: text,
        parsed_json: parsed,
        total_price: parsed.total_price ?? null,
        currency: parsed.currency ?? null
      }
    });

    let scoreObj = {};
    if (rfpId) {
      const rfp = await prisma.rFP.findUnique({ where: { id: rfpId }});
      scoreObj = scoring.computeScoreFromProposalAndRfp({ ...proposal, parsed_json: parsed }, rfp);
      await prisma.proposal.update({ where: { id: proposal.id }, data: { score: scoreObj.score, recommendation: scoreObj.reason }});
    }

    res.json({ success: true, data: { proposalId: proposal.id, parsed, scoreObj }});
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
