import React from 'react';
import { Link2 } from 'lucide-react';

export default function LinkedDealCard({ linkedDeal }) {
  return (
    <div className="linked-deal-card">
      <div className="linked-deal-header">
        <Link2 size={14} />
        Linked Deal
      </div>
      <div className="linked-deal-title">{linkedDeal}</div>
      <div className="linked-deal-status">Status: Fulfillment Completed</div>
      <button className="btn-secondary" style={{ width: '100%', marginTop: '8px', padding: '8px' }}>
        View Deal
      </button>
    </div>
  );
}
