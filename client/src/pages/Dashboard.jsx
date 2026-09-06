import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, AlertTriangle, Clock, RefreshCw, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ onNavigate }) {
  const [userName, setUserName] = useState('Atharva');
  const [greeting, setGreeting] = useState('Good morning');
  const [summary, setSummary] = useState({
    openDeals: 0,
    pipelineValue: '₹0.00L',
    pendingApprovals: 0,
    atRiskDeals: 0,
    actionRequired: 0,
  });
  const [recentDeals, setRecentDeals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Determine greeting from time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Read logged-in user name
    try {
      const stored = localStorage.getItem('dealflow-user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.name) setUserName(u.name.split(' ')[0]);
      }
    } catch (e) {
      // ignore
    }

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumData, dealsData] = await Promise.allSettled([
        api.dashboard.getSummary(),
        api.dashboard.getRecentDeals(),
      ]);

      if (sumData.status === 'fulfilled' && sumData.value) {
        setSummary({
          openDeals: sumData.value.openDeals ?? 0,
          pipelineValue: sumData.value.pipelineValue ?? '₹0.00L',
          pendingApprovals: sumData.value.pendingApprovals ?? 0,
          atRiskDeals: sumData.value.atRiskDeals ?? 0,
          actionRequired: sumData.value.actionRequired ?? 0,
          openDealsDescription: sumData.value.openDealsDescription,
          pipelineDescription: sumData.value.pipelineDescription,
          actionRequiredDescription: sumData.value.actionRequiredDescription,
        });
      }

      if (dealsData.status === 'fulfilled' && Array.isArray(dealsData.value)) {
        setRecentDeals(dealsData.value);
      }
    } catch (err) {
      console.warn('Dashboard live fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="content">
      <div className="page-card">
        {/* Welcome Section */}
        <div className="welcome-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="welcome-label">Sales Overview</span>
            <h1 className="welcome-title">{greeting}, {userName}.</h1>
            <p className="welcome-subtitle">Central deal operations hub linking quote-to-cash lifecycle.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline" onClick={loadDashboardData} title="Refresh live metrics" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={15} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
            <button className="btn-primary new-quotation" onClick={() => onNavigate && onNavigate('quotation-detail', {})} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} />
              <span>New Quotation</span>
            </button>
          </div>
        </div>
      </div>

      <div className="page-card">
        <div className="mini-card-grid">
          <div className="mini-card" onClick={() => onNavigate && onNavigate('approvals')} style={{ cursor: 'pointer' }}>
            <div className="mini-card-title">Pending Approvals</div>
            <div className="mini-card-value" style={{ color: '#d97706' }}>
              {summary.pendingApprovals} quotations waiting
            </div>
          </div>
          <div className="mini-card" onClick={() => onNavigate && onNavigate('quotations')} style={{ cursor: 'pointer' }}>
            <div className="mini-card-title">Open Pipeline Value</div>
            <div className="mini-card-value" style={{ color: '#2563eb' }}>
              {summary.pipelineValue} ({summary.openDeals} active)
            </div>
          </div>
          <div className="mini-card" onClick={() => onNavigate && onNavigate('deal-health')} style={{ cursor: 'pointer' }}>
            <div className="mini-card-title">At-Risk Deals</div>
            <div className="mini-card-value" style={{ color: '#dc2626' }}>
              {summary.atRiskDeals} flagged by Deal Health
            </div>
          </div>
        </div>
      </div>

      {/* Recent Live Deals or Activity */}
      <div className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ margin: 0 }}>Recent Pipeline Deals</h2>
          <button className="btn-outline" onClick={() => onNavigate && onNavigate('quotations')} style={{ fontSize: '12px', padding: '4px 10px' }}>
            View All Deals <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </button>
        </div>

        {recentDeals.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Deal ID</th>
                  <th>Customer</th>
                  <th>Value</th>
                  <th>Stage</th>
                  <th>Last Update</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.slice(0, 5).map((deal) => (
                  <tr key={deal.id} onClick={() => onNavigate && onNavigate('quotation-detail', deal)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600 }}>{deal.id}</td>
                    <td>{deal.customer}</td>
                    <td style={{ fontWeight: 600 }}>{deal.value}</td>
                    <td>
                      <span className={`badge ${deal.stage === 'Accepted' ? 'green' : 'orange'}`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td>{deal.updated}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate && onNavigate('quotation-detail', deal);
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="audit-trail">
            <div className="audit-item"><span className="audit-dot" /><div className="audit-body"><div className="audit-title">No recent pipeline deals found</div><div className="audit-meta">Create a quotation to start the pipeline.</div></div></div>
          </div>
        )}
      </div>
    </main>
  );
}
