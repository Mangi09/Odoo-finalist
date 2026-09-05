import React from 'react';

export default function MetricCard({ title, value, description, icon: Icon, accentClass = '' }) {
  return (
    <div className={`metric-card ${accentClass}`}>
      <div className="metric-icon">
        <Icon size={24} />
      </div>
      <div className="metric-content">
        <span className="metric-title">{title}</span>
        <span className="metric-value">{value}</span>
        <span className="metric-desc">{description}</span>
      </div>
    </div>
  );
}
