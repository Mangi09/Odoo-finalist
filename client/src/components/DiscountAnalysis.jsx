import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function DiscountAnalysis({ items }) {
  // Re-calculate to find effective discount percentage
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const totalDiscount = items.reduce((acc, item) => {
    return acc + ((item.quantity * item.unitPrice) * (item.discountPercent / 100));
  }, 0);

  const effectiveDiscountPercent = subtotal > 0 ? ((totalDiscount / subtotal) * 100).toFixed(1) : 0;
  
  // Logic to determine policy
  const isWithinPolicy = effectiveDiscountPercent <= 15; // Example policy: max 15%

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="qd-card">
      <div className="qd-card-header">
        Discount Information
      </div>
      
      <div className="discount-analysis">
        <div className="discount-metric">
          <span>Total Discount:</span>
          <strong>{formatCurrency(totalDiscount)}</strong>
        </div>
        <div className="discount-metric">
          <span>Effective Rate:</span>
          <strong>{effectiveDiscountPercent}%</strong>
        </div>
        
        <div className={`discount-status ${isWithinPolicy ? 'ok' : 'warning'}`} style={{ marginTop: '8px' }}>
          {isWithinPolicy ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
          <span>{isWithinPolicy ? 'Within Allowed Range' : 'Manager Approval Required'}</span>
        </div>
      </div>
    </div>
  );
}
