import React, { useState, useEffect } from 'react';
import api from '../api/apiClient';

export default function ProposalComparison({ rfpId, onSelect }) {
  const [proposals, setProposals] = useState([]);

  useEffect(()=> {
    if (!rfpId) return;
    api.get(`/proposals/rfp/${rfpId}`).then(r => setProposals(r.data.data)).catch(()=> {});
  }, [rfpId]);

  if (!rfpId) return <div>No RFP selected</div>;

  // find highest score
  const best = proposals.reduce((acc, p) => (p.score > (acc.score || 0) ? p : acc), {});

  const scoreStyle = (score) => {
    if (score >= 80) return { background: '#d4f5d4', padding: '4px 8px', borderRadius: 999, color: '#0b7a0b', fontWeight:700 };
    if (score >= 60) return { background: '#fff4d6', padding: '4px 8px', borderRadius: 999 };
    return { background: '#ffd6d6', padding: '4px 8px', borderRadius: 999 };
  };

  return (
    <div style={{ border: '1px solid #eee', padding: 12 }}>
      <h3>Proposal Comparison</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {proposals.map(p => {
          const isBest = best && p.id === best.id;
          return (
            <div key={p.id} onClick={() => onSelect && onSelect(p)}style={{cursor: 'pointer',border: isBest ? '2px solid #0b7a0b' : '1px solid #ddd',padding: 12,borderRadius: 8,background: isBest ? '#f3fff3' : '#fff'}}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div><strong>{p.vendor?.name || p.vendorId}</strong></div>
                <div style={scoreStyle(p.score ?? 0)}>{p.score ?? '—'}</div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div>Total: {p.total_price || (p.parsed_json && p.parsed_json.total_price) || '—'}</div>
                <div>Delivery: {p.delivery_days || (p.parsed_json && p.parsed_json.delivery_days) || '—'}</div>
                <div>Warranty: {p.warranty_months || (p.parsed_json && p.parsed_json.warranty_months) || '—'}</div>
                <div style={{ marginTop: 8 }}>
                  <a href="#" onClick={(e)=>{ e.preventDefault(); window.alert(JSON.stringify(p.parsed_json || {}, null, 2)); }}>View parsed JSON</a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
