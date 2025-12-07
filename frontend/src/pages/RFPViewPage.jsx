import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/apiClient';
import ProposalComparison from '../components/ProposalComparison';
import ProposalDetail from '../components/ProposalDetail';

export default function RFPViewPage(){
  const { id } = useParams();
  const [rfp, setRfp] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(()=> {
    if (!id) return;
    api.get(`/rfps/${id}`).then(r => setRfp(r.data.data)).catch(()=>{});
  }, [id]);

  return (
    <div style={{ display:'grid', gridTemplateColumns: '2fr 1fr', gap:12 }}>
      <div>
        <h2>RFP: {rfp?.title || id}</h2>
        <p>{rfp?.description}</p>
        <div>
          <Link to={`/rfp/${id}/compare`}><button>Compare Proposals</button></Link>
        </div>
        <div style={{ marginTop: 20 }}>
          <h3>Proposals</h3>
          <ProposalComparison rfpId={id} onSelect={(p)=>setSelectedProposal(p)} />
        </div>
      </div>

      <aside>
        <h3>Proposal Detail</h3>
        <ProposalDetail proposalId={selectedProposal?.id} onUpdated={()=>{ /* refresh if needed */ }} />
      </aside>
    </div>
  );
}
