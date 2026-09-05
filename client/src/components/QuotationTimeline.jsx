import React from 'react';

export default function QuotationTimeline({ currentStage }) {
  const stages = [
    'Quotation Created',
    'Negotiation',
    'Approval',
    'Accepted',
    'Fulfillment'
  ];

  // Map the application stage to the timeline index
  const stageMap = {
    'Draft': 0,
    'Negotiation': 1,
    'Approval Pending': 2,
    'Approval': 2,
    'Accepted': 3,
    'Fulfillment': 4
  };

  const currentIndex = stageMap[currentStage] !== undefined ? stageMap[currentStage] : 0;

  return (
    <div className="qd-card qd-timeline-card">
      <div className="qd-timeline">
        {stages.map((stage, index) => {
          let statusClass = '';
          if (index < currentIndex) statusClass = 'completed';
          else if (index === currentIndex) statusClass = 'current';

          return (
            <div key={index} className={`timeline-step ${statusClass}`}>
              <div className="timeline-dot">
                {index < currentIndex ? '✓' : index + 1}
              </div>
              <span className="timeline-label">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
