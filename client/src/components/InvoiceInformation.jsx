import React from 'react';
import { FileText } from 'lucide-react';

export default function InvoiceInformation({ invoice }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Draft': return 'status-draft';
      case 'Posted': return 'status-posted';
      case 'Emailed': return 'status-emailed';
      case 'Partially Paid': return 'status-partially-paid';
      case 'Paid': return 'status-paid';
      case 'Overdue': return 'status-overdue';
      default: return 'status-draft';
    }
  };

  return (
    <div className="inv-card">
      <div className="inv-card-header">
        <FileText size={18} />
        Invoice Summary
      </div>
      <div className="inv-info-grid">
        <div className="inv-info-item">
          <span className="inv-info-label">Invoice #</span>
          <span className="inv-info-value">{invoice.id}</span>
        </div>
        <div className="inv-info-item">
          <span className="inv-info-label">Amount</span>
          <span className="inv-amount">{formatCurrency(invoice.amount)}</span>
        </div>
        <div className="inv-info-item">
          <span className="inv-info-label">Status</span>
          <span className={`inv-status-badge ${getStatusClass(invoice.status)}`}>{invoice.status}</span>
        </div>
        <div className="inv-info-item">
          <span className="inv-info-label">Due Date</span>
          <span className="inv-info-value">{invoice.dueDate}</span>
        </div>
        <div className="inv-info-item">
          <span className="inv-info-label">Linked Deal</span>
          <span className="inv-info-value" style={{ color: 'var(--blue-slate)' }}>{invoice.linkedDeal}</span>
        </div>
        <div className="inv-info-item">
          <span className="inv-info-label">Customer</span>
          <span className="inv-info-value">{invoice.customer}</span>
        </div>
        <div className="inv-info-item">
          <span className="inv-info-label">Invoice Date</span>
          <span className="inv-info-value">{invoice.invoiceDate}</span>
        </div>
        <div className="inv-info-item">
          <span className="inv-info-label">Payment Terms</span>
          <span className="inv-info-value">{invoice.paymentTerms}</span>
        </div>
      </div>
    </div>
  );
}
