import React from 'react';
import { PieChart } from 'lucide-react';

export default function HealthDistribution() {
  const distribution = [
    { label: 'Healthy', count: 24, percent: 65, colorClass: 'healthy' },
    { label: 'Needs Attention', count: 7, percent: 19, colorClass: 'attention' },
    { label: 'At Risk', count: 4, percent: 11, colorClass: 'risk' },
    { label: 'Critical', count: 2, percent: 5, colorClass: 'critical' },
  ];

  return (
    <div className="dh-card">
      <div className="dh-card-title">
        <PieChart size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Deal Health Distribution
      </div>
      
      <div className="dh-dist-bar">
        {distribution.map((item, i) => (
          <div 
            key={i} 
            className={`dh-dist-segment ${item.colorClass}`} 
            style={{ width: `${item.percent}%` }}
            title={`${item.label}: ${item.percent}%`}
          ></div>
        ))}
      </div>
      
      <div className="dh-dist-legend">
        {distribution.map((item, i) => (
          <div key={i} className="dh-legend-item">
            <div className={`dh-legend-dot dh-dist-segment ${item.colorClass}`}></div>
            <span className="dh-legend-text">{item.label}</span>
            <span className="dh-legend-count">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
