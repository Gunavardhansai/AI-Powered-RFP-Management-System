// backend/src/services/pdfService.js
const fs = require('fs');
const PDFDocument = require('pdfkit');
const pdfParse = require('pdf-parse');

exports.extractTextFromFile = async (filepath) => {
  const data = fs.readFileSync(filepath);
  try {
    const res = await pdfParse(data);
    return res.text;
  } catch (e) {
    return '';
  }
};

exports.generateRfpPdf = async (rfp, destinationPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(destinationPath);
      doc.pipe(stream);

      doc.fontSize(20).text(rfp.title || 'RFP', { underline: true });
      doc.moveDown();

      doc.fontSize(12).text(`RFP ID: ${rfp.id || ''}`);
      doc.moveDown();

      if (rfp.description) {
        doc.fontSize(12).text(rfp.description);
        doc.moveDown();
      }

      doc.fontSize(14).text('Items:', { underline: true });
      (rfp.items || []).forEach(it => {
        const specs = (it.specs && typeof it.specs === 'object') ? JSON.stringify(it.specs) : (it.specs || '');
        doc.fontSize(12).text(`- ${it.qty || 1} × ${it.name} ${specs}`);
      });

      doc.moveDown();
      doc.text(`Budget: ${rfp.budget || 'N/A'} ${rfp.currency || ''}`);
      doc.text(`Delivery (days): ${rfp.delivery_days || 'N/A'}`);
      doc.text(`Payment terms: ${rfp.payment_terms || 'N/A'}`);
      doc.text(`Warranty months: ${rfp.warranty_months || 'N/A'}`);

      doc.end();
      stream.on('finish', () => resolve(destinationPath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};
