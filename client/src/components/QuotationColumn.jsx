import React, { useState } from 'react';
import QuotationCard from './QuotationCard';

export default function QuotationColumn({ stageKey, stageTitle, quotations, onDropQuotation }) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const quoteId = e.dataTransfer.getData('text/plain');
    if (quoteId) {
      onDropQuotation(quoteId, stageKey);
    }
  };

  return (
    <div 
      className={`kanban-column stage-${stageKey.toLowerCase()} ${isOver ? 'is-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title-wrapper">
          <div className="column-indicator"></div>
          <span className="column-title">{stageTitle}</span>
        </div>
        <span className="column-count">{quotations.length}</span>
      </div>
      <div className="column-content">
        {quotations.map(quote => (
          <QuotationCard key={quote.id} quote={quote} />
        ))}
      </div>
    </div>
  );
}
