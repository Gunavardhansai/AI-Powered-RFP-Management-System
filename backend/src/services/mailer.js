// backend/src/services/mailer.js
const nodemailer = require('nodemailer');
const { logger } = require('../lib/logger');

async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_HOST.trim() !== '') {
    logger.info(`Using SMTP host ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 1025}`);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 1025),
      secure: false,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      tls: { rejectUnauthorized: false }
    });
  }
  logger.info('No SMTP_HOST configured — creating Ethereal test account for local dev');
  const testAccount = await nodemailer.createTestAccount();
  logger.info(`Ethereal account created: ${testAccount.user}`);
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
}

let transportPromise = createTransporter();

exports.sendMail = async ({ to, subject, html, text, attachments = [] }) => {
  const from = process.env.EMAIL_FROM || 'rfp@localhost';
  const transport = await transportPromise;
  try {
    const info = await transport.sendMail({ from, to, subject, text, html, attachments });
    logger.info('Mail sent', info?.messageId || '');
    const preview = nodemailer.getTestMessageUrl(info) || null;
    if (preview) logger.info('Preview URL: ' + preview);
    return { info, preview };
  } catch (err) {
    logger.error('Mail error', err);
    throw err;
  }
};
