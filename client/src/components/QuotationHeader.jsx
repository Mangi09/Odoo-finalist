import React from 'react';
import { Link } from 'react-router-dom';

export default function QuotationHeader({ quotation, onSaveDraft, onSubmitApproval }) {
  return (
    <div className="qd-header">
      <div>
        <div className="qd-breadcrumb">
          <Link to="/quotations">Quotations</Link> / {quotation.id}
        </div>
        <div className="qd-title-area">
          <h1 className="qd-title">{quotation.id}</h1>
          <span className="qd-customer">{quotation.customer.name}</span>
        </div>
        <p className="qd-subtitle">{quotation.title}</p>
      </div>
      
      <div className="qd-header-actions">
        <div className="qd-status-badge">
          Status: {quotation.stage}
        </div>
        <div className="qd-action-row">
          <button className="btn-secondary" onClick={onSaveDraft}>Save Draft</button>
          <button className="btn-primary sm" onClick={onSubmitApproval}>
            {quotation.stage === 'Draft' || quotation.stage === 'Negotiation' ? 'Submit for Approval' : 'Update Quotation'}
          </button>
        </div>
      </div>
    </div>
  );
}
