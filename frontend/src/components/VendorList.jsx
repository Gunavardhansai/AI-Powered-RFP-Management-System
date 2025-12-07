import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';

export default function VendorList({ onSelect }) {
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const load = async () => {
    const res = await api.get('/vendors');
    setVendors(res.data.data);
  };

  useEffect(()=>{ load(); }, []);

  const add = async () => {
    await api.post('/vendors', { name, email });
    setName(''); setEmail('');
    load();
  };

  return (
    <div style={{ border: '1px solid #eee', padding: 12 }}>
      <h3>Vendors</h3>
      <div>
        <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <button onClick={add}>Add</button>
      </div>
      <ul>
        {vendors.map(v => (
          <li key={v.id}>
            <label>
              <input type="checkbox" value={v.id} onChange={(e)=>onSelect && onSelect(v, e.target.checked)} />
              {v.name} ({v.email})
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
