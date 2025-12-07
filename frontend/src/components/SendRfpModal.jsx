// frontend/src/components/SendRfpModal.jsx
import React, { useState } from 'react';
import api from '../api/apiClient';

export default function SendRfpModal({ rfp, selectedVendorIds = [], onClose, onSent }) {
  const [subject, setSubject] = useState(`RFP: ${rfp?.title || ''} [RFP_REF=${rfp?.id || ''}]`);
  const [body, setBody] = useState(rfp?.description || '');
  const [attachPdf, setAttachPdf] = useState(true);
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const send = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/rfps/${rfp.id}/send`, { vendorIds: selectedVendorIds, attachPdf, subject, body });
      const urls = res.data.data.map(r => r.preview).filter(Boolean);
      setPreviewUrls(urls);
      if (onSent) onSent(urls);
    } catch (e) {
      alert('Send failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', left: 0, right: 0, top: 0, bottom:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', padding:20, width:600, borderRadius:8 }}>
        <h3>Send RFP</h3>
        <div>
          <label>Subject</label>
          <input style={{ width: '100%' }} value={subject} onChange={e=>setSubject(e.target.value)} />
        </div>
        <div>
          <label>Message</label>
          <textarea style={{ width:'100%', height:120 }} value={body} onChange={e=>setBody(e.target.value)} />
        </div>
        <div>
          <label><input type="checkbox" checked={attachPdf} onChange={e=>setAttachPdf(e.target.checked)} /> Attach generated PDF</label>
        </div>
        <div style={{ display:'flex', gap:8, marginTop:12 }}>
          <button onClick={send} disabled={loading}>Send</button>
          <button onClick={onClose}>Close</button>
        </div>

        {loading && <div>Sending…</div>}

        {previewUrls.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <h4>Preview URLs</h4>
            <ul>
              {previewUrls.map((u,i) => <li key={i}><a href={u} target="_blank" rel="noreferrer">{u}</a></li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
