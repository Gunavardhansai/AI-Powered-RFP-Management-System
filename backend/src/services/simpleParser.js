// naive text parsers for demo purposes
const currencyRegex = /(\$|USD|EUR|INR)\s?([\d,]+(\.\d{1,2})?)/i;

function parseNumber(s) {
  if (!s) return null;
  const cleaned = s.replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

exports.parseRfpText = (text) => {
  const title = text.split('\n')[0].slice(0, 80);
  // budget
  const budgetMatch = text.match(/budget[:\s]*\$?([\d,\.]+)/i);
  const budget = budgetMatch ? parseNumber(budgetMatch[0]) : null;
  const currencyMatch = text.match(/(USD|INR|EUR|\$)/i);
  const currency = currencyMatch ? (currencyMatch[1] || '$') : null;

  // items: look for lines like "20 laptops", "15 monitors"
  const itemRegex = /(\d+)\s+([A-Za-z\- ]{2,40})/g;
  const items = [];
  let m;
  while ((m = itemRegex.exec(text)) !== null) {
    items.push({ name: m[2].trim(), qty: parseInt(m[1], 10) });
  }

  return {
    title: title || 'RFP',
    description: text,
    budget: budget,
    currency,
    delivery_days: (text.match(/(\d+)\s*days/i) || [])[1] ? parseInt((text.match(/(\d+)\s*days/i) || [])[1], 10) : null,
    payment_terms: (text.match(/net\s*\d+/i) || [])[0] || null,
    warranty_months: (text.match(/(\d+)\s*year/i) ? parseInt((text.match(/(\d+)\s*year/i) || [])[1], 10) * 12 : (text.match(/(\d+)\s*month/i) ? parseInt((text.match(/(\d+)\s*month/i) || [])[1], 10) : null)),
    items
  };
};

exports.parseVendorText = (text) => {
  // look for total price and items
  const totalMatch = text.match(/total[:\s]*\$?([\d,\.]+)/i) || text.match(/grand total[:\s]*\$?([\d,\.]+)/i);
  const total_price = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : null;
  const currencyMatch = text.match(/(USD|INR|EUR|\$)/i);
  const currency = currencyMatch ? (currencyMatch[1] || '$') : null;

  // find item lines like "Laptop - 20 x $1200"
  const itemRegex = /([A-Za-z\- ]{2,40})[\s\-:|]*?(\d+)\s*(?:x|@)\s*\$?([\d,\.]+)/g;
  const items = [];
  let m;
  while ((m = itemRegex.exec(text)) !== null) {
    items.push({
      name: m[1].trim(),
      qty: parseInt(m[2], 10),
      unit_price: parseFloat(m[3].replace(/,/g, '')),
      total_price: parseInt(m[2], 10) * parseFloat(m[3].replace(/,/g, ''))
    });
  }

  const deliveryDaysMatch = text.match(/delivery[:\s]*within\s*(\d+)\s*days/i) || text.match(/ETA[:\s]*(\d+)\s*days/i);
  const delivery_days = deliveryDaysMatch ? parseInt(deliveryDaysMatch[1], 10) : null;

  const warrantyMatch = text.match(/(\d+)\s*year/i) || text.match(/(\d+)\s*months/i);
  const warranty_months = warrantyMatch ? (warrantyMatch[0].toLowerCase().includes('year') ? parseInt(warrantyMatch[1], 10) * 12 : parseInt(warrantyMatch[1], 10)) : null;

  // completeness: simple heuristic
  const completeness_score = items.length > 0 && total_price ? 0.9 : 0.6;

  return {
    vendor_name: null,
    vendor_email: null,
    items,
    total_price,
    currency,
    delivery_days,
    payment_terms: (text.match(/net\s*\d+/i) || [])[0] || null,
    warranty_months,
    completeness_score,
    notes: text.slice(0, 500)
  };
};
