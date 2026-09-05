import React from 'react';
import { Plus, BriefcaseBusiness, TrendingUp, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import MetricCard from '../components/MetricCard';
import ActionRequired from '../components/ActionRequired';
import QuickActions from '../components/QuickActions';
import RecentDeals from '../components/RecentDeals';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <span className="welcome-label">Sales Overview</span>
          <h1 className="welcome-title">Good morning, Atharva.</h1>
          <p className="welcome-subtitle">Here’s what needs your attention across your deals today.</p>
        </div>
        <button className="btn-primary new-quotation" onClick={() => navigate('/quotations')}>
          <Plus size={18} />
          New Quotation
        </button>
      </div>

      {/* Metrics Section */}
      <div className="metrics-container">
        <MetricCard 
          title="Open Deals" 
          value="24" 
          description="Across active stages"
          icon={BriefcaseBusiness}
        />
        <MetricCard 
          title="Pipeline Value" 
          value="₹18.4L" 
          description="Active opportunities"
          icon={TrendingUp}
        />
        <MetricCard 
          title="Action Required" 
          value="5" 
          description="Deals need attention"
          icon={CircleAlert}
          accentClass="accent-coral"
        />
      </div>

      {/* Main Action Area (Two columns on desktop) */}
      <div className="two-col-layout">
        <ActionRequired />
        <QuickActions />
      </div>

      {/* Recent Deals Table */}
      <RecentDeals />
    </DashboardLayout>
  );
}
