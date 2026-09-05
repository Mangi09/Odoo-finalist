import React from 'react';

export default function PaymentProgress({ totalPaid, totalAmount }) {
  const percentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
  const remaining = totalAmount - totalPaid;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="inv-card">
      <div className="inv-card-header">Payment Progress</div>
      <div className="payment-progress-container">
        <div className="progress-labels">
          <span className="progress-paid">{formatCurrency(totalPaid)} Paid</span>
          <span className="progress-remaining">{formatCurrency(remaining)} Remaining</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}
