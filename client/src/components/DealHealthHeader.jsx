import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function DealHealthHeader() {
  return (
    <div className="dh-header">
      <div className="dh-header-left">
        <h1 className="dh-title">Deal Health & Anomaly Dashboard</h1>
        <p className="dh-subtitle">Monitor deal performance, detect risks, and identify opportunities requiring immediate attention.</p>
      </div>
      
      <div className="dh-header-right">
        <select className="dh-select">
          <option>Last 30 Days</option>
          <option>Last 60 Days</option>
          <option>This Quarter</option>
          <option>This Year</option>
        </select>
        <button className="btn-secondary" style={{ padding: '8px', border: 'none' }}>
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}
