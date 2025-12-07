// backend/src/controllers/rfpController.js
const _ = require('lodash');
const { prisma } = require('../lib/prismaClient');
const aiService = require('../services/aiService');
const scoring = require('../services/scoring');
const mailer = require('../services/mailer');

// ---------------------
// Create RFP from text
// ---------------------
exports.createFromText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'text is required' });
    }

    let structured;
    try {
      structured = await aiService.parseRfpTextToStructured(text);
    } catch {
      structured = {
        title: text.slice(0, 60),
        description: text,
        items: [],
        budget: null,
        currency: 'USD',
        delivery_days: null,
        payment_terms: null,
        warranty_months: null
      };
    }

    const rfp = await prisma.rFP.create({
      data: {
        title: structured.title || 'RFP',
        description: structured.description || text,
        budget: structured.budget || null,
        currency: structured.currency || 'USD',
        delivery_days: structured.delivery_days || null,
        payment_terms: structured.payment_terms || null,
        warranty_months: structured.warranty_months || null,
        items: {
          create: (structured.items || []).map((it) => ({
            name: it.name || it.description || 'Item',
            qty: it.qty || it.quantity || 1,
            specs: it.specs || {}
          }))
        }
      },
      include: { items: true }
    });

    return res.json({ success: true, data: rfp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------------
// List RFPs
// ---------------------
exports.listRfps = async (req, res) => {
  try {
    const rfps = await prisma.rFP.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: rfps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------------
// Get single RFP
// ---------------------
exports.getRfpById = async (req, res) => {
  try {
    const id = req.params.id;
    const rfp = await prisma.rFP.findUnique({
      where: { id },
      include: {
        items: true,
        proposals: { include: { vendor: true } }
      }
    });
    if (!rfp) {
      return res.status(404).json({ success: false, error: 'RFP not found' });
    }
    res.json({ success: true, data: rfp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------------
// Send RFP to vendors
// ---------------------
exports.sendRfp = async (req, res) => {
  try {
    const id = req.params.id;
    const { vendorIds = [] } = req.body;

    const rfp = await prisma.rFP.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!rfp) return res.status(404).json({ success: false, error: 'RFP not found' });

    const vendors = await prisma.vendor.findMany({
      where: { id: { in: vendorIds } }
    });

    const logs = [];
    for (const v of vendors) {
      const subject = `RFP: ${rfp.title} [RFP_REF=${rfp.id}]`;
      const body =
        `Please provide a proposal for the following RFP:\n\n${rfp.description || ''}\n\n` +
        `Budget: ${rfp.budget || 'N/A'} ${rfp.currency || ''}\n` +
        `Delivery days: ${rfp.delivery_days || 'N/A'}\n` +
        `Payment terms: ${rfp.payment_terms || 'N/A'}\n` +
        `Warranty months: ${rfp.warranty_months || 'N/A'}`;

      const { preview } = await mailer.sendMail({
        to: v.email,
        subject,
        text: body
      });

      const log = await prisma.emailLog.create({
        data: {
          type: 'outbound',
          to: v.email,
          from: process.env.EMAIL_FROM || 'rfp@localhost',
          subject,
          body,
          raw: { previewUrl: preview || null }
        }
      });

      logs.push({ log, preview: preview || null });
    }


    res.json({ success: true, data: logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Send failed' });
  }
};

// ---------------------
// Compare proposals for RFP
// ---------------------
exports.compareRfpProposals = async (req, res) => {
  const id = req.params.id;
  try {
    const proposals = await prisma.proposal.findMany({
      where: { rfpId: id },
      include: { vendor: true }
    });

    if (!proposals || proposals.length === 0) {
      return res.json({
        success: true,
        data: { canCompare: false, reason: 'no_proposals', proposals: [] }
      });
    }

    const normalize = (p) => {
      const json = p.parsed_json || {};
      return {
        items: json.items || [],
        total_price: Number(json.total_price || p.total_price || 0) || 0,
        delivery_days: Number(json.delivery_days || p.delivery_days || 0) || 0,
        warranty_months:
          Number(json.warranty_months || p.warranty_months || 0) || 0,
        vendorId: p.vendorId
      };
    };

    const normalized = proposals.map((p) => ({ ...p, normalized: normalize(p) }));

    const equalExceptVendor = (a, b) => {
      const aa = _.omit(a.normalized, ['vendorId']);
      const bb = _.omit(b.normalized, ['vendorId']);
      return _.isEqual(aa, bb);
    };

    let allSame = true;
    for (let i = 0; i < normalized.length; i++) {
      for (let j = i + 1; j < normalized.length; j++) {
        if (!equalExceptVendor(normalized[i], normalized[j])) {
          allSame = false;
          break;
        }
      }
      if (!allSame) break;
    }

    const scored = normalized.map((p) => ({
      id: p.id,
      vendor: p.vendor,
      parsed: p.parsed_json || {},
      score: Number(p.score || 0),
      normalized: p.normalized
    }));

    return res.json({
      success: true,
      data: {
        canCompare: !allSame && scored.length > 1,
        reason: allSame ? 'all_proposals_identical' : 'differences_found',
        proposals: scored
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
