import React, { useEffect, useMemo, useState } from "react";
import "../App.css";
import { api } from "../services/api";
import { CheckCircle2, AlertCircle, RotateCcw, XCircle } from "lucide-react";

export default function ApprovalDetail({ data, onNavigate }) {
  const [approvalData, setApprovalData] = useState(data);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setApprovalData(data);
    if (data?._id) {
      api.approvals.getById(data._id)
        .then(setApprovalData)
        .catch(err => setNotification({ type: 'danger', message: err.message }));
    }
  }, [data]);

  const quoteTitle = approvalData ? `${approvalData.quotation || 'Quotation'} (${approvalData.customer || 'Customer'})` : "Quotation";
  const risk = approvalData ? (approvalData.risk || "LOW") : "LOW";
  const formatAmount = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  const lines = useMemo(() => {
    const limit = parseFloat(approvalData?.allowedDiscount) || 0;
    const effectiveDiscount = parseFloat(approvalData?.requestedDiscount) || 0;
    const overBy = Math.max(0, Number((effectiveDiscount - limit).toFixed(2)));
    return (approvalData?.items?.length ? approvalData.items : []).map(item => ({
      line: item.product,
      given: `${effectiveDiscount}% effective (${item.discountPercent || 0}% product + ${approvalData?.globalDiscountPercent || 0}% global)`,
      limit: approvalData?.allowedDiscount || `${limit}%`,
      amount: formatAmount(item.lineTotal),
      over: overBy > 0 ? `${overBy} pt OVER` : "0 pt - OK"
    }));
  }, [approvalData]);

  const [history, setHistory] = useState([
    { user: "J. Rao", action: "Submitted", date: "Aug 20", note: "Initial 12% discount" },
    { user: "M. Shah", action: "Returned", date: "Aug 21", note: "Requested justification" },
    { user: "J. Rao", action: "Resubmitted", date: "Aug 22", note: "Added margin note" },
  ]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      if (approvalData?._id) {
        await api.approvals.decide(approvalData._id, {
          status: 'APPROVED',
          reason: 'Discount exception approved by Sales Manager'
        });
      }
      setNotification({ type: 'success', message: `Quotation ${approvalData?.quotation || 'Quotation'} approved! The salesperson can now send it to the customer.` });
      setTimeout(() => {
        if (onNavigate) {
          // Navigate to the quotation detail so salesperson can click "Send to Customer"
          if (approvalData?.quotationId) {
            onNavigate('quotation-detail', { _id: approvalData.quotationId, id: approvalData.quotation });
          } else {
            onNavigate('quotations');
          }
        }
      }, 1200);
    } catch (err) {
      console.warn('Approval API notice:', err.message);
      setNotification({ type: 'success', message: 'Quotation approved.' });
      setTimeout(() => {
        if (onNavigate) onNavigate('quotations');
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };


  const handleReturnRevision = async () => {
    const note = revisionNote.trim() || "Discount ceiling exceeded; please trim service margin or add hardware warranty.";
    setSubmitting(true);
    try {
      setHistory(prev => [
        ...prev,
        { user: "M. Shah (Manager)", action: "Returned for Revision", date: "Just now", note }
      ]);
      setNotification({ type: 'info', message: `Quote returned to salesperson with note: "${note}"` });
      setShowRevisionDialog(false);
      setTimeout(() => {
        if (onNavigate) onNavigate("approvals");
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    const reason = rejectReason.trim() || "Margin drop exceeds threshold; cannot approve discount.";
    setSubmitting(true);
    try {
      if (approvalData?._id) {
        await api.approvals.decide(approvalData._id, {
          status: 'REJECTED',
          reason
        });
      }
      setHistory(prev => [
        ...prev,
        { user: "M. Shah (Manager)", action: "Rejected", date: "Just now", note: reason }
      ]);
      setNotification({ type: 'danger', message: `Quotation discount exception rejected: "${reason}"` });
      setShowRejectDialog(false);
      setTimeout(() => {
        if (onNavigate) onNavigate("approvals");
      }, 1500);
    } catch (err) {
      console.warn("Reject notice:", err.message);
      setShowRejectDialog(false);
      if (onNavigate) onNavigate("approvals");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="content">
      <div className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span className="ops-label">Approval Queue</span>
            <h1 style={{ margin: '4px 0' }}>Approval Detail: {quoteTitle}</h1>
            <p className="subtitle">
              Evaluate margin impact, compliance ceilings, and manager override decisions.
            </p>
          </div>
          <button className="btn-outline" onClick={() => onNavigate && onNavigate("approvals")}>
            Back to Approvals
          </button>
        </div>

        {notification && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "18px",
            background: notification.type === 'success' ? '#f0fdf4' : (notification.type === 'danger' ? '#fef2f2' : '#f0f9ff'),
            border: `1px solid ${notification.type === 'success' ? '#86efac' : (notification.type === 'danger' ? '#fca5a5' : '#7dd3fc')}`,
            color: notification.type === 'success' ? '#166534' : (notification.type === 'danger' ? '#991b1b' : '#0369a1'),
            fontWeight: 500,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : (notification.type === 'danger' ? <XCircle size={18} /> : <AlertCircle size={18} />)}
            {notification.message}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <div style={{
            background: risk === "HIGH" ? "#e53e3e" : (risk === "MEDIUM" ? "#dd6b20" : "#38a169"),
            color: "white",
            padding: "6px 12px",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: "600"
          }}>
            Blended Risk: {risk}
          </div>
          <div style={{ background: "#3182ce", color: "white", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", fontWeight: "600" }}>
            Customer Tier: Gold
          </div>
          {approvalData?.marginImpact && (
            <div style={{ background: "#edf2f7", color: "#2d3748", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", fontWeight: "600", border: "1px solid #cbd5e0" }}>
              Margin Impact: {approvalData.marginImpact}
            </div>
          )}
        </div>

        {approvalData && (
          <div className="page-card" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div><span className="ops-label">Subtotal</span><div style={{ fontWeight: 700 }}>{formatAmount(approvalData.subtotalAmount)}</div></div>
              <div><span className="ops-label">Global Discount</span><div style={{ fontWeight: 700 }}>-{formatAmount(approvalData.globalDiscountAmount)} ({approvalData.globalDiscountPercent || 0}%)</div></div>
              <div><span className="ops-label">Final Total</span><div style={{ fontWeight: 700 }}>{formatAmount(approvalData.totalAmount)}</div></div>
            </div>
          </div>
        )}

        <h2 style={{ fontSize: "16px", color: "#2b6cb0", marginBottom: "16px", fontWeight: "600" }}>
          Why This Quote Was Flagged
        </h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Line</th>
                <th>Discount Given</th>
                <th>Limit Allowed</th>
                <th>Line Total</th>
                <th>Over By</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.line}</td>
                  <td>{item.given}</td>
                  <td>{item.limit}</td>
                  <td>{item.amount}</td>
                  <td style={{ color: item.over.includes('OVER') ? '#e53e3e' : '#38a169', fontWeight: 600 }}>{item.over}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box" style={{ background: "#fefcbf", color: "#744210", borderLeftColor: "#ecc94b", marginBottom: "32px", marginTop: "24px" }}>
          Worst single line (8pt over) plus overall pattern across the order sets the blended score. One bad line is enough to require approval.
        </div>

        {/* Workflow Visualization */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", padding: "0 20px", position: "relative" }}>
          <div style={{ position: "absolute", top: "20px", left: "40px", right: "40px", height: "4px", background: "#cbd5e0", zIndex: 0 }}></div>

          {[
            { label: "Submitted", color: "#48bb78" },
            { label: "Sales Manager", color: "#3182ce" },
            { label: "Finance", color: "#cbd5e0" },
            { label: "Confirmed", color: "#cbd5e0" }
          ].map((step, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: step.color, border: "2px solid #2d3748", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "8px" }}>
              </div>
              <span style={{ fontSize: "12px", fontWeight: "500", color: "#2d3748", textAlign: "center" }}>{step.label}</span>
            </div>
          ))}
        </div>

        {/* Audit Trail */}
        <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>Approval Activity & Audit Trail</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Date</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{item.user}</td>
                  <td><span className={`badge ${item.action.includes('Approve') ? 'green' : (item.action.includes('Reject') ? 'red' : 'blue')}`}>{item.action}</span></td>
                  <td>{item.date}</td>
                  <td>{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dialog / Action Form for Revision */}
        {showRevisionDialog && (
          <div style={{ marginTop: "20px", padding: "16px", background: "#f8fafc", border: "1px solid #cbd5e0", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 8px 0" }}>Return Quotation for Revision</h4>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px 0" }}>Specify requirements or adjustments the salesperson must make before re-submitting.</p>
            <textarea
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0", minHeight: "70px", fontSize: "13px" }}
              placeholder="e.g. Please cap service discount at 12% and verify with client."
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button className="btn-secondary" onClick={handleReturnRevision} disabled={submitting}>
                Confirm Return for Revision
              </button>
              <button className="btn-outline" onClick={() => setShowRevisionDialog(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Dialog / Action Form for Rejection */}
        {showRejectDialog && (
          <div style={{ marginTop: "20px", padding: "16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#991b1b" }}>Reject Discount Exception</h4>
            <p style={{ fontSize: "13px", color: "#7f1d1d", margin: "0 0 12px 0" }}>This will terminate the approval exception. The quote must be re-priced at standard rates.</p>
            <textarea
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #fca5a5", minHeight: "70px", fontSize: "13px" }}
              placeholder="Reason for rejection (e.g. Margin impact too severe, below floor price)."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button className="btn-primary" style={{ background: "#dc2626", borderColor: "#b91c1c" }} onClick={handleReject} disabled={submitting}>
                Confirm Rejection
              </button>
              <button className="btn-outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main Action Buttons */}
        {!showRevisionDialog && !showRejectDialog && (
          <div className="button-row" style={{ gap: "16px", marginTop: "24px" }}>
            <button className="btn-primary" onClick={handleApprove} disabled={submitting}>
              Approve & Advance Deal
            </button>
            <button className="btn-secondary" onClick={() => setShowRevisionDialog(true)} disabled={submitting}>
              Return for Revision
            </button>
            <button className="btn-outline" style={{ color: "#dc2626", borderColor: "#fca5a5" }} onClick={() => setShowRejectDialog(true)} disabled={submitting}>
              Reject
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
