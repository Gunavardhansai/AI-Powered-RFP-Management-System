import React, { useState } from 'react';
import api from '../api/apiClient';

export default function RFPChatCreate({ onCreated }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/rfps/from-text', { text });
      setResult(res.data.data);
      if (onCreated) onCreated(res.data.data);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 12 }}>
      <h3>Create RFP (natural language)</h3>
      <textarea rows={8} style={{ width: '100%' }} value={text} onChange={(e)=>setText(e.target.value)} placeholder="e.g., I need 20 laptops with 16GB RAM and 15 monitors 27-inch. Budget is $50,000. Delivery within 30 days." />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleCreate} disabled={loading}>Create RFP</button>
      </div>
      {loading && <div>Parsing...</div>}
      {result && (
        <div style={{ marginTop: 12 }}>
          <h4>Structured RFP</h4>
          <pre style={{ maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
