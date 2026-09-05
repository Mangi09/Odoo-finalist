import React from 'react';
import { CreditCard } from 'lucide-react';

export default function PaymentHistory({ payments }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="inv-card">
      <div className="inv-card-header">
        <CreditCard size={18} />
        Payment History
      </div>
      <div className="inv-table-responsive">
        {payments.length > 0 ? (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.date}</td>
                  <td style={{ fontWeight: 600, color: 'var(--blue-slate)' }}>
                    {formatCurrency(payment.amount)}
                  </td>
                  <td>{payment.method}</td>
                  <td>{payment.reference}</td>
                  <td>{payment.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-payments">
            <span>No payments recorded yet.</span>
            <span style={{ fontSize: '13px' }}>Record a payment to update the invoice balance.</span>
          </div>
        )}
      </div>
    </div>
  );
}
