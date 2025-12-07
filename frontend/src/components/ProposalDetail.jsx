// frontend/src/components/ProposalDetail.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/apiClient';

export default function ProposalDetail({ proposalId, onUpdated }) {
  const [proposal, setProposal] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(()=> {
    if (!proposalId) return;
    api.get(`/proposals/${proposalId}`).then(r => {
      setProposal(r.data.data);
      setForm({
        total_price: r.data.data.total_price || r.data.data.parsed_json?.total_price || '',
        delivery_days: r.data.data.delivery_days || r.data.data.parsed_json?.delivery_days || '',
        warranty_months: r.data.data.warranty_months || r.data.data.parsed_json?.warranty_months || ''
      });
    }).catch(()=> {});
  }, [proposalId]);

  if (!proposalId) return <div>Select a proposal</div>;
  if (!proposal) return <div>Loading...</div>;

  const save = async () => {
    // partial update
    await api.put(`/proposals/${proposalId}`, form).catch(()=>{});
    // recompute score
    await api.post(`/proposals/${proposalId}/score`);
    const res = await api.get(`/proposals/${proposalId}`);
    setProposal(res.data.data);
    setEditing(false);
    if (onUpdated) onUpdated(res.data.data);
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 12 }}>
      <h3>Proposal detail</h3>
      <div><strong>Vendor:</strong> {proposal.vendor?.name || proposal.vendorId}</div>
      <div><strong>Score:</strong> {proposal.score ?? '—'}</div>
      <div style={{ marginTop:8 }}>
        <label>Total price</label>
        <input value={form.total_price} onChange={e=>setForm({...form, total_price: e.target.value})} />
      </div>
      <div>
        <label>Delivery days</label>
        <input value={form.delivery_days} onChange={e=>setForm({...form, delivery_days: e.target.value})} />
      </div>
      <div>
        <label>Warranty months</label>
        <input value={form.warranty_months} onChange={e=>setForm({...form, warranty_months: e.target.value})} />
      </div>
      <div style={{ marginTop:8 }}>
        <button onClick={save}>Save & Recompute Score</button>
      </div>
      <div style={{ marginTop:8 }}>
        <h4>Raw parsed JSON</h4>
        <pre style={{ maxHeight:200, overflow:'auto' }}>{JSON.stringify(proposal.parsed_json, null, 2)}</pre>
      </div>
    </div>
  );
}
