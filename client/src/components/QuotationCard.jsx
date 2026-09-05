import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuotationCard({ quote }) {
  const navigate = useNavigate();

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', quote.id);
    // Subtle visual feedback on drag
    setTimeout(() => {
      if (e.target) e.target.classList.add('is-dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    if (e.target) e.target.classList.remove('is-dragging');
  };

  return (
    <div 
      className="quotation-card"
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => navigate(`/quotations/${quote.id}`)}
    >
      <div className="card-header-top">
        <span className="quote-id">{quote.id}</span>
        {quote.isPriority && <span className="priority-high">★</span>}
      </div>
      <div className="card-body">
        <span className="customer-name">{quote.customer}</span>
        <span className="deal-title">{quote.title}</span>
      </div>
      <div className="card-footer">
        <span className="deal-value">{quote.value}</span>
        <span className="last-updated">{quote.updated}</span>
      </div>
    </div>
  );
}
