import React from 'react';
import { History } from 'lucide-react';

export default function InvoiceActivity({ activities }) {
  return (
    <div className="inv-card">
      <div className="inv-card-header">
        <History size={18} />
        Invoice Activity
      </div>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-dot"></div>
            <div className="activity-content">
              <span className="activity-title">{activity.title}</span>
              <span className="activity-time">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
