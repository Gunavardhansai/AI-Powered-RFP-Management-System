import React, { useState } from 'react';
import RFPChatCreate from '../components/RFPChatCreate';
import VendorList from '../components/VendorList';
import api from '../api/apiClient';
import SendRfpModal from '../components/SendRfpModal';

export default function RFPCreatePage() {
  const [selected, setSelected] = useState({});
  const [rfp, setRfp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleVendorSelect = (vendor, checked) => {
    setSelected(prev => {
      const copy = { ...prev };
      if (checked) copy[vendor.id] = vendor;
      else delete copy[vendor.id];
      return copy;
    });
  };

  const sendRfp = async () => {
    if (!rfp) return alert('Create an RFP first');
    if (Object.keys(selected).length === 0) return alert('Select at least one vendor');
    setShowModal(true);
  };

  return (
    <div>
      <RFPChatCreate onCreated={(r) => setRfp(r)} />
      <div style={{ marginTop: 12 }}>
        <VendorList onSelect={handleVendorSelect} />
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={sendRfp}>Send RFP to selected vendors</button>
      </div>

      {showModal && <SendRfpModal
        rfp={rfp}
        selectedVendorIds={Object.keys(selected)}
        onClose={()=>setShowModal(false)}
        onSent={(urls)=>{ setShowModal(false); if (urls && urls.length) window.open(urls[0], '_blank'); }}
      />}
    </div>
  );
}
