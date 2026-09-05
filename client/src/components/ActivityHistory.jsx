import React from 'react';
import { History } from 'lucide-react';

export default function ActivityHistory({ activities }) {
  return (
    <div className="qd-card">
      <div className="qd-card-header">
        <History size={18} />
        Quotation Activity
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
