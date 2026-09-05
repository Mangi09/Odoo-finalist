import React from 'react';
import { Check } from 'lucide-react';

export default function InvoiceLifecycle({ currentStage }) {
  const stages = [
    'Invoice Created',
    'Posted',
    'Emailed',
    'Paid'
  ];

  // Map the application status to the timeline index
  const stageMap = {
    'Draft': 0,
    'Posted': 1,
    'Emailed': 2,
    'Partially Paid': 2, // Still in emailed state essentially, but partially paid
    'Overdue': 2,
    'Paid': 3
  };

  const currentIndex = stageMap[currentStage] !== undefined ? stageMap[currentStage] : 0;

  return (
    <div className="inv-card" style={{ padding: '24px 0' }}>
      <div className="inv-timeline">
        {stages.map((stage, index) => {
          let statusClass = '';
          if (index < currentIndex || currentStage === 'Paid') {
             statusClass = 'completed';
          }
          else if (index === currentIndex && currentStage !== 'Paid') {
             statusClass = 'current';
          }

          return (
            <div key={index} className={`inv-timeline-step ${statusClass}`}>
              <div className="inv-timeline-indicator">
                {(index < currentIndex || currentStage === 'Paid') ? <Check size={14} /> : '○'}
              </div>
              <span className="inv-timeline-label">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
