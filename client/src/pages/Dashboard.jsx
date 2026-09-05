import React from 'react';
import { Plus, BriefcaseBusiness, TrendingUp, CircleAlert } from 'lucide-react';
// import MetricCard from '../components/MetricCard';
// import ActionRequired from '../components/ActionRequired';
// import QuickActions from '../components/QuickActions';
// import RecentDeals from '../components/RecentDeals';

export default function Dashboard({ onNavigate }) {
  return (
    <main className="content">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <span className="welcome-label">Sales Overview</span>
          <h1 className="welcome-title">Good morning, Atharva.</h1>
          <p className="welcome-subtitle">Here’s what needs your attention across your deals today.</p>
        </div>
        <button className="btn-primary new-quotation" onClick={() => onNavigate && onNavigate('quotations')}>
          <Plus size={18} />
          New Quotation
        </button>
      </div>

      {/* Metrics Section */}
      <div className="metrics-container">
        <div className="info-box" style={{ marginTop: '20px', gridColumn: '1 / -1' }}>
          Dashboard components coming soon.
        </div>
      </div>

      {/* Main Action Area (Two columns on desktop) */}
      <div className="two-col-layout">
      </div>
    </main>
  );
}
