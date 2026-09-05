import React from 'react';
import { RefreshCw, Download } from 'lucide-react';

export default function AdminHeader() {
  return (
    <div className="admin-header">
      <div className="admin-header-left">
        <h1 className="admin-title">Admin Insights</h1>
        <p className="admin-subtitle">Monitor performance, activity, and trends across the complete deal ecosystem.</p>
      </div>
      
      <div className="admin-header-right">
        <select className="admin-select">
          <option>Last 30 Days</option>
          <option>This Quarter</option>
          <option>This Year</option>
          <option>All Time</option>
        </select>
        <button className="btn-secondary" style={{ padding: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Refresh Data">
          <RefreshCw size={16} />
        </button>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid var(--border-color)' }}>
          <Download size={16} />
          Export Report
        </button>
      </div>
    </div>
  );
}
