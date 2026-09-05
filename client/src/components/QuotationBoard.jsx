import React from 'react';
import QuotationColumn from './QuotationColumn';
import { FileText } from 'lucide-react';

export default function QuotationBoard({ quotations, onDropQuotation }) {
  const stages = [
    { key: 'Draft', title: 'DRAFT' },
    { key: 'Sent', title: 'SENT' },
    { key: 'Negotiation', title: 'NEGOTIATION' },
    { key: 'Approval', title: 'APPROVAL' },
    { key: 'Accepted', title: 'ACCEPTED' },
  ];

  if (quotations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FileText size={32} />
        </div>
        <h3 className="empty-title">No quotations found</h3>
        <p className="empty-desc">Try adjusting your filters or create a new quotation.</p>
        <button className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
          + New Quotation
        </button>
      </div>
    );
  }

  return (
    <div className="kanban-board">
      {stages.map((stage) => {
        const stageQuotes = quotations.filter(q => q.stage === stage.key);
        return (
          <QuotationColumn 
            key={stage.key} 
            stageKey={stage.key} 
            stageTitle={stage.title} 
            quotations={stageQuotes}
            onDropQuotation={onDropQuotation}
          />
        );
      })}
    </div>
  );
}
