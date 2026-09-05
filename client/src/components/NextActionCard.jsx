import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function NextActionCard({ stage, onSubmitApproval }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (stage !== 'Draft' && stage !== 'Negotiation') {
    return (
      <div className="qd-card next-action-card" style={{ backgroundColor: 'var(--white)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
        <div className="qd-card-header" style={{ color: 'var(--blue-slate)', borderBottomColor: 'var(--border-color)' }}>Current Status</div>
        <div className="discount-status ok" style={{ backgroundColor: 'var(--lavender-light)', color: 'var(--blue-slate)' }}>
          <CheckCircle2 size={16} />
          <span>This quotation is currently in <strong>{stage}</strong> phase.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="qd-card next-action-card">
        <div className="qd-card-header">Next Step</div>
        <div>
          <p className="next-action-desc">Submit this quotation for manager approval.</p>
          <p className="next-action-desc" style={{ fontSize: '11px', opacity: 0.7 }}>The requested discount and quotation value will be evaluated against company policies.</p>
        </div>
        <button className="btn-white" onClick={() => setShowConfirm(true)}>
          Submit for Approval
        </button>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-header">Submit for Approval?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
              This quotation will be sent to the appropriate approver based on the configured approval rules.
            </p>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-primary" style={{ width: 'auto' }} onClick={() => {
                onSubmitApproval();
                setShowConfirm(false);
              }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
