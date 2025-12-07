import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import RFPListPage from './pages/RFPListPage';
import RFPCreatePage from './pages/RFPCreatePage';
import VendorsPage from './pages/VendorsPage';
import RFPViewPage from './pages/RFPViewPage';
import ComparePage from './pages/ComparePage';

export default function App(){
  return (
    <div>
      <header style={{ padding: 20, background: '#f3f4f6' }}>
        <h1 style={{ margin:0 }}>AI RFP Management (Demo)</h1>
        <nav style={{ marginTop:10 }}>
          <Link to="/" style={{ marginRight:12 }}>RFPs</Link>
          <Link to="/create">Create RFP</Link>
          <Link to="/vendors" style={{ marginLeft: 12 }}>Vendors</Link>
        </nav>
      </header>

      <main style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<RFPListPage />} />
          <Route path="/create" element={<RFPCreatePage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/rfp/:id" element={<RFPViewPage />} />
          <Route path="/rfp/:id/compare" element={<ComparePage />} />
        </Routes>
      </main>
    </div>
  );
}
