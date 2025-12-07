import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/apiClient';

export default function ComparePage(){
  const { id } = useParams();
  const [payload, setPayload] = useState(null);

  useEffect(()=> {
    if (!id) return;
    api.get(`/rfps/${id}/compare`).then(r => setPayload(r.data.data)).catch(e => setPayload({ error: e.message }));
  }, [id]);

  if (!payload) return <div>Loading...</div>;
  if (payload.error) return <div>Error: {payload.error}</div>;

  if (!payload.canCompare) {
    return (
      <div>
        <h2>Compare Proposals</h2>
        <p>No comparison necessary: {payload.reason}</p>
        <Link to={`/rfp/${id}`}>Back to RFP</Link>
      </div>
    );
  }

  // show comparison cards with scores
  const proposals = payload.proposals || [];
  const best = proposals.reduce((acc,p)=> (p.score> (acc.score||0)? p:acc), {});

  return (
    <div>
      <h2>Compare Proposals for RFP {id}</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
        {proposals.map(p => {
          const isBest = p.id === best.id;
          return (
            <div key={p.id} style={{ border: isBest ? '2px solid #0b7a0b' : '1px solid #ddd', padding:12, borderRadius:6 }}>
              <h4>{p.vendor?.name || p.vendorId}</h4>
              <div>Score: <strong>{p.score}</strong></div>
              <div>Total Price: {p.parsed?.total_price || '—'}</div>
              <div>Delivery: {p.parsed?.delivery_days || '—'}</div>
              <div>Warranty: {p.parsed?.warranty_months || '—'}</div>
              <pre style={{ maxHeight:150, overflow:'auto' }}>{JSON.stringify(p.parsed, null, 2)}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
