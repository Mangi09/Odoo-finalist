import React from 'react';
import { FileText, FilePenLine, Clock3, CircleAlert } from 'lucide-react';

export default function QuotationSummary() {
  const summaries = [
    { title: 'Total Quotations', value: '18', desc: 'Across all stages', icon: FileText },
    { title: 'Drafts', value: '4', desc: 'Still being prepared', icon: FilePenLine },
    { title: 'Awaiting Response', value: '6', desc: 'Sent to customers', icon: Clock3 },
    { title: 'Action Required', value: '3', desc: 'Needs your attention', icon: CircleAlert, accentClass: 'accent-coral' },
  ];

  return (
    <div className="summary-container">
      {summaries.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className={`summary-card ${item.accentClass || ''}`}>
            <div className="summary-icon">
              <Icon size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-title">{item.title}</span>
              <span className="summary-value">{item.value}</span>
              <span className="summary-desc">{item.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
