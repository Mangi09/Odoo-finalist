import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function AttentionPanel({ items }) {
  const getIconClass = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'normal';
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-title">
        Requires Attention
      </div>
      
      <div className="attention-list">
        {items.map((item, i) => (
          <div key={i} className="attention-row">
            <div className="attention-header">
              <AlertCircle size={16} className={`attention-icon ${getIconClass(item.severity)}`} />
              {item.title}
            </div>
            <div className="attention-desc">
              {item.description}
            </div>
            <button className="btn-secondary attention-action" style={{ padding: '4px 12px', fontSize: '12px', width: 'fit-content' }}>
              Review <ArrowRight size={12} style={{ marginLeft: '4px' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
