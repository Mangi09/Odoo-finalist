import React from 'react';
import { Link } from 'react-router-dom';
import { Download, CreditCard } from 'lucide-react';

export default function InvoiceHeader({ invoice, onRecordPayment, onDownload }) {
  return (
    <div className="inv-header">
      <div className="inv-header-left">
        <div className="inv-breadcrumb">
          <Link to="#">Invoices</Link> / {invoice.id}
        </div>
        <div className="inv-title-area">
          <h1 className="inv-title">Invoice Detail: {invoice.id}</h1>
          <span className="inv-customer">{invoice.customer}</span>
        </div>
        <p className="inv-subtitle">Review invoice details, payment progress and transaction history.</p>
      </div>
      
      <div className="inv-actions">
        <button className="btn-secondary" onClick={onDownload}>
          <Download size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Download Invoice
        </button>
        <button 
          className="btn-primary" 
          onClick={onRecordPayment}
          disabled={invoice.status === 'Paid'}
          style={invoice.status === 'Paid' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <CreditCard size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Record Payment
        </button>
      </div>
    </div>
  );
}
