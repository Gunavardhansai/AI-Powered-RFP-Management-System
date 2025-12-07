require('dotenv').config();
const { logger } = require('../lib/logger');
const z = require('zod');
const simpleParser = require('./simpleParser'); // internal helper we'll create
const OpenAI = require('openai'); // optional: recommended to install only if using OpenAI

const USE_OPENAI = (process.env.USE_OPENAI || 'false') === 'true';

let client;
if (USE_OPENAI && process.env.OPENAI_API_KEY) {
  try {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (e) {
    logger.warn('OpenAI client init failed', e);
    client = null;
  }
}

module.exports = {
  parseRfpTextToStructured: async (text) => {
    if (USE_OPENAI && client) {
      // Placeholder: user may customize
      try {
        const prompt = `Convert this procurement request into a JSON structure.\n\nRequest:\n${text}\n\nReturn only JSON.`;
        const response = await client.responses.create({
          model: "gpt-4o-mini",
          input: prompt,
          max_output_tokens: 800
        });
        const out = response.output_text || response.output?.[0]?.content?.[0]?.text;
        return JSON.parse(out);
      } catch (e) {
        logger.warn('OpenAI failed, falling back to simple parser', e);
      }
    }
    // Fallback: use simpleParser
    return simpleParser.parseRfpText(text);
  },

  parseVendorResponse: async ({ text, attachments = [] }) => {
    // attachments: array with fields: path, originalname
    // If OpenAI available, optionally pass combined text.
    if (USE_OPENAI && client) {
      try {
        const combined = text + '\n\n' + attachments.map(a => `Attachment ${a.originalname || a.filename}`).join('\n');
        const prompt = `Extract a proposal JSON from the vendor reply. Return JSON only. Text:\n${combined}`;
        const response = await client.responses.create({
          model: "gpt-4o-mini",
          input: prompt,
          max_output_tokens: 1200
        });
        const out = response.output_text || response.output?.[0]?.content?.[0]?.text;
        return JSON.parse(out);
      } catch (e) {
        logger.warn('OpenAI parse failed, falling back to simple parser', e);
      }
    }
    // fallback parser: simple heuristics
    return simpleParser.parseVendorText(text);
  }
};
