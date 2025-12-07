import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';

export default function RFPDetails({ rfpId }) {
  const [rfp, setRfp] = useState(null);

  useEffect(()=> {
    if (!rfpId) return;
    api.get(`/rfps/${rfpId}`).then(r => setRfp(r.data.data)).catch(()=>{});
  }, [rfpId]);

  if (!rfp) return <div>Select an RFP to view</div>;

  return (
    <div style={{ border: '1px solid #ddd', padding: 12 }}>
      <h3>{rfp.title}</h3>
      <p>{rfp.description}</p>
      <p>Budget: {rfp.budget} {rfp.currency}</p>
      <h4>Items</h4>
      <ul>
        {rfp.items.map(it => <li key={it.id}>{it.qty} x {it.name}</li>)}
      </ul>
      <h4>Proposals</h4>
      <ul>
        {rfp.proposals.map(p => <li key={p.id}>{p.vendor?.name || p.vendorId} — Score: {p.score ?? 'n/a'}</li>)}
      </ul>
    </div>
  );
}
