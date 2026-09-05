import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function AtRiskDealsTable({ deals }) {
  const getHealthColor = (score) => {
    if (score >= 70) return 'var(--blue-slate)';
    if (score >= 40) return '#f59e0b';
    return 'var(--light-coral-dark)';
  };

  const getRiskBadgeClass = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'healthy';
      case 'medium': return 'medium';
      case 'high': return 'high';
      case 'critical': return 'critical';
      default: return 'medium';
    }
  };

  return (
    <div className="dh-card">
      <div className="dh-card-title">
        <AlertTriangle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Deals Requiring Attention
      </div>
      
      <div className="dh-table-wrapper">
        <table className="dh-table">
          <thead>
            <tr>
              <th>Deal & Customer</th>
              <th>Stage</th>
              <th>Health Score</th>
              <th>Risk</th>
              <th>Last Activity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal, i) => (
              <tr key={i}>
                <td>
                  <span className="dh-table-deal">{deal.deal}</span>
                  <span className="dh-table-customer">{deal.customer}</span>
                </td>
                <td>{deal.stage}</td>
                <td>
                  <div className="dh-health-score">
                    <div className="dh-score-bar">
                      <div 
                        className="dh-score-fill" 
                        style={{ width: `${deal.healthScore}%`, backgroundColor: getHealthColor(deal.healthScore) }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{deal.healthScore}%</span>
                  </div>
                </td>
                <td>
                  <span className={`dh-severity-badge ${getRiskBadgeClass(deal.risk)}`}>
                    {deal.risk}
                  </span>
                </td>
                <td>{deal.lastActivity}</td>
                <td>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', border: 'none' }}>
                    View <ArrowRight size={12} style={{ marginLeft: '4px' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
