import React from 'react';

export default function LifecycleOverview({ stages }) {
  return (
    <div className="admin-card">
      <div className="admin-card-title">Deal Lifecycle Overview</div>
      <span className="admin-card-subtitle">Current distribution of deals across the business workflow.</span>
      
      <div className="lifecycle-flow-wrapper">
        <div className="lifecycle-flow">
          {stages.map((stage, index) => (
            <div key={index} className={`lifecycle-node ${stage.bottleneck ? 'bottleneck' : ''}`}>
              <div className="lifecycle-count-circle">
                {stage.count}
              </div>
              <div className="lifecycle-stage-name">{stage.name}</div>
              
              <div className="lifecycle-tooltip">
                Avg time: {stage.avgTime}
                <br/>
                Completion rate: {stage.completionRate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
