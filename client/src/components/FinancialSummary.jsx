import React from 'react';
import { Calculator } from 'lucide-react';

export default function FinancialSummary({ items }) {
  
  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const totalDiscount = items.reduce((acc, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    return acc + (itemTotal * (item.discountPercent / 100));
  }, 0);
  
  const taxableAmount = subtotal - totalDiscount;
  const tax = taxableAmount * 0.18; // 18% GST example
  const grandTotal = taxableAmount + tax;

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
        <Calculator size={18} />
        Quotation Summary
      </div>
      
      <div className="financial-rows">
        <div className="financial-row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="financial-row discount-row">
          <span>Discount</span>
          <span>− {formatCurrency(totalDiscount)}</span>
        </div>
        <div className="financial-row">
          <span>GST (18%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        
        <div className="financial-total">
          <span>TOTAL</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
