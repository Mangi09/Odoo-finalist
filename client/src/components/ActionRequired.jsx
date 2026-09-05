import React from 'react';
import { ShieldCheck, MessageSquare, PackageCheck, ArrowRight, CircleAlert } from 'lucide-react';

export default function ActionRequired() {
  const actions = [
    {
      id: 1,
      icon: ShieldCheck,
      title: 'Quotation Q-1042 requires manager approval',
      status: 'Waiting for Approval',
      statusClass: 'status-waiting',
      actionText: 'View Deal',
    },
    {
      id: 2,
      icon: MessageSquare,
      title: 'Customer response received for Q-1038',
      status: 'Negotiation',
      statusClass: 'status-negotiation',
      actionText: 'Review Response',
    },
    {
      id: 3,
      icon: PackageCheck,
      title: 'Inventory availability needs confirmation',
      status: 'Fulfillment',
      statusClass: 'status-fulfillment',
      actionText: 'Check Inventory',
    },
  ];

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h2 className="card-title">Action Required</h2>
      </div>
      <div className="action-list">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div key={action.id} className="action-item">
              <div className="action-icon">
                <Icon size={20} />
              </div>
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <span className="action-desc">Status: {action.status}</span>
              </div>
              <div className="action-meta">
                <span className={`status-badge ${action.statusClass}`}>{action.status}</span>
                <button className="btn-link-action">
                  {action.actionText} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
        {actions.length === 0 && (
          <div className="action-item" style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
            No actions required at this time.
          </div>
        )}
      </div>
    </div>
  );
}
