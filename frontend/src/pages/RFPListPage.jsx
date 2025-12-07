import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

export default function RFPListPage(){
  const [list, setList] = useState([]);
  const nav = useNavigate();
  useEffect(()=> {
    api.get('/rfps').then(r => setList(r.data.data || [])).catch(()=>{});
  }, []);
  return (
    <div>
      <h2>RFPs</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {list.map(r => (
          <div key={r.id} style={{ border:'1px solid #ddd', padding:12, borderRadius:6 }}>
            <h3>{r.title || r.id}</h3>
            <p>{r.description?.slice?.(0,140)}</p>
            <div>
              <button onClick={()=>nav(`/rfp/${r.id}`)}>View Details</button>
              <button onClick={()=>nav(`/rfp/${r.id}/compare`)} style={{ marginLeft:8 }}>Compare Proposals</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
