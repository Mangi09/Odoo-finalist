import React from 'react';
import { User, Calendar, CreditCard, Building2 } from 'lucide-react';

export function CustomerInfo({ customer }) {
  // Get initials for avatar
  const initials = customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="qd-card">
      <div className="qd-card-header">
        <Building2 size={18} />
        Customer Information
      </div>
      <div className="customer-avatar">{initials}</div>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Customer Name</span>
          <span className="info-value">{customer.name}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Contact Person</span>
          <span className="info-value"><User size={14} className="text-muted" /> {customer.contact}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Email</span>
          <span className="info-value">{customer.email}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Phone</span>
          <span className="info-value">{customer.phone}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Customer Category</span>
          <span className="info-value">{customer.category}</span>
        </div>
      </div>
    </div>
  );
}

export function QuotationDetails({ quotation }) {
  return (
    <div className="qd-card">
      <div className="qd-card-header">
        <Calendar size={18} />
        Quotation Details
      </div>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Quotation Number</span>
          <span className="info-value">{quotation.id}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Quotation Date</span>
          <span className="info-value">{quotation.date}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Validity</span>
          <span className="info-value">{quotation.validity}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Salesperson</span>
          <span className="info-value">{quotation.salesperson}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Payment Terms</span>
          <span className="info-value"><CreditCard size={14} className="text-muted" /> {quotation.paymentTerms}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Currency</span>
          <span className="info-value">{quotation.currency}</span>
        </div>
      </div>
    </div>
  );
}
