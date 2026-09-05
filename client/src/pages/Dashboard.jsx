import React from 'react';
import { Plus } from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  return (
    <main className="content">
      <div className="page-card">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div>
            <span className="welcome-label">Sales Overview</span>
            <h1 className="welcome-title">Good morning, Atharva.</h1>
            <p className="welcome-subtitle">Central hub, links out to every module below.</p>
          </div>
          <button className="btn-primary new-quotation" onClick={() => onNavigate && onNavigate('new-quotation')}>
            <Plus size={18} />
            New Quotation
          </button>
        </div>
      </div>

      <div className="page-card">
        <div className="mini-card-grid">
          <div className="mini-card"><div className="mini-card-title">Pending Approvals</div><div className="mini-card-value">3 quotations waiting</div></div>
          <div className="mini-card"><div className="mini-card-title">Open Quotations</div><div className="mini-card-value">6 active deals</div></div>
          <div className="mini-card"><div className="mini-card-title">At-Risk Deals</div><div className="mini-card-value">2 flagged by Deal Health</div></div>
        </div>
      </div>

      <div className="page-card">
        <h2>Recent Activity</h2>
        <div className="audit-trail">
          <div className="audit-item"><span className="audit-dot" /><div className="audit-body"><div className="audit-title">Acme Corp quotation reopened by Finance</div><div className="audit-meta">Discount exception requires note from Sales Manager</div></div></div>
          <div className="audit-item"><span className="audit-dot" /><div className="audit-body"><div className="audit-title">Stock split computed for Q-1042</div><div className="audit-meta">Main Warehouse plus East Depot</div></div></div>
          <div className="audit-item"><span className="audit-dot" /><div className="audit-body"><div className="audit-title">Best products exported to Deal Health</div><div className="audit-meta">Laptop Pro 14 and Care Plan 2yr</div></div></div>
        </div>
      </div>
    </main>
  );
}
