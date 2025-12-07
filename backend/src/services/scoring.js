// scoring logic consistent with the spec
exports.computeScoreFromProposalAndRfp = (proposal, rfp) => {
  // proposal: may have total_price, delivery_days, warranty_months, parsed_json
  const minPrice = proposal.total_price || (proposal.parsed_json && proposal.parsed_json.total_price) || null;
  const proposalPrice = proposal.total_price ?? (proposal.parsed_json?.total_price ?? null);

  // For demo: if rfp.budget exists, compute relative price score
  let priceScore = 0.5;
  if (proposalPrice && rfp.budget) {
    // lower price better relative to budget; normalized
    priceScore = Math.max(0, Math.min(1, 1 - ((proposalPrice - (rfp.budget || 0)) / (rfp.budget || proposalPrice))));
  } else if (proposalPrice) {
    priceScore = 1 / (1 + Math.log1p(proposalPrice || 1));
    priceScore = Math.min(1, priceScore * 10);
  }

  const deliveryScore = (() => {
    const p = proposal.delivery_days ?? proposal.parsed_json?.delivery_days ?? null;
    const target = rfp.delivery_days || 30;
    if (!p) return 0.5;
    const val = Math.max(0, Math.min(1, 1 - ((p - target) / Math.max(target, p))));
    return val;
  })();

  const warrantyScore = (() => {
    const w = proposal.warranty_months ?? proposal.parsed_json?.warranty_months ?? (rfp.warranty_months || 0);
    if (!w) return 0.3;
    return Math.min(1, w / Math.max(12, w));
  })();

  const completeness = proposal.parsed_json?.completeness_score ?? proposal.parsed_json?.items?.length ? 0.8 : 0.4;

  const termsScore = proposal.payment_terms ? (proposal.payment_terms.toLowerCase().includes('net 30') ? 1 : 0.7) : 0.5;

  const final = (0.4 * priceScore) + (0.2 * deliveryScore) + (0.15 * warrantyScore) + (0.15 * completeness) + (0.1 * termsScore);
  const score = Math.round(final * 100);

  const reason = `Score breakdown: price ${Math.round(priceScore*100)} / delivery ${Math.round(deliveryScore*100)} / warranty ${Math.round(warrantyScore*100)} / completeness ${Math.round(completeness*100)}.`

  return { score, reason, breakdown: { priceScore, deliveryScore, warrantyScore, completeness, termsScore } };
};
