import React from 'react';

export default function AdminActivityTimeline({ activities }) {
  return (
    <div className="admin-card">
      <div className="admin-card-title">Recent Business Activity</div>
      
      <div className="admin-activity-list">
        {activities.map((activity, i) => (
          <div key={i} className="admin-activity-item">
            <div className="admin-activity-dot"></div>
            <div className="admin-activity-content">
              <span className="admin-activity-title">{activity.title}</span>
              <span className="admin-activity-time">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
