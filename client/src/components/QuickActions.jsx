import React from 'react';
import { Plus, MessageSquare, ShieldCheck, HeartPulse, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: 'Create Quotation', icon: Plus, isPrimary: true, action: () => console.log('Create Quotation') },
    { label: 'View Negotiations', icon: MessageSquare, action: () => console.log('View Negotiations') },
    { label: 'Check Approvals', icon: ShieldCheck, action: () => console.log('Check Approvals') },
    { label: 'View Deal Health', icon: HeartPulse, action: () => console.log('View Deal Health') },
  ];

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h2 className="card-title">Quick Actions</h2>
      </div>
      <div className="quick-actions-list">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button 
              key={idx} 
              className={`quick-action-btn ${action.isPrimary ? 'primary-action' : ''}`}
              onClick={action.action}
            >
              <div className="quick-action-icon">
                <Icon size={18} />
              </div>
              <span>{action.label}</span>
              <ArrowRight size={14} className="quick-action-arrow" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
