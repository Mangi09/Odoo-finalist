import React, { useEffect, useMemo, useState } from "react";
import "../App.css";
import { api } from "../services/api";
import { Download, CheckCircle, CreditCard, ArrowLeft } from "lucide-react";

export default function InvoiceDetailPage({ invoice, onNavigate, currentUser }) {
  const [current, setCurrent] = useState(invoice || {});
  const paidStatus = current?.status === "Paid" || current?.status === "PAID";
  const [paid, setPaid] = useState(paidStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const amountDisplay = useMemo(() => (
    typeof current.amount === 'number' ? `₹${current.amount.toLocaleString('en-IN')}` : current.amount
  ), [current.amount]);

  useEffect(() => {
    setCurrent(invoice || {});
    setPaid(invoice?.status === "Paid" || invoice?.status === "PAID");
    if (invoice?._id) {
      api.invoices.getById(invoice._id)
        .then(data => {
          setCurrent(prev => ({ ...prev, ...data }));
          setPaid(data?.status === "Paid" || data?.status === "PAID");
        })
        .catch(err => setMessage({ type: "error", text: err.message }));
    }
  }, [invoice]);

  const handleRecordPayment = async () => {
    setLoading(true);
    try {
      if (current._id) {
        await api.invoices.recordPayment(current._id, {
          amount: current.rawAmount || current.amount,
          method: "OTHER",
          reference: `REC-${Date.now().toString().slice(-6)}`
        });
      }
      setPaid(true);
      setMessage({ type: "success", text: `Payment of ${amountDisplay} recorded successfully. Deal marked as Paid!` });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!current._id) return;
    setLoading(true);
    try {
      const blob = await api.invoices.downloadPdf(current._id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${current.id || current._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header">
          <div className="page-header-left">
            <span className="ops-label">Invoice Detail</span>
            <h1>Invoice Detail: {current.id} ({current.customer})</h1>
            <p className="subtitle">Audit invoice ledger, payment reconciliation, and tax documentation.</p>
          </div>
          <button className="btn-outline" onClick={() => onNavigate && onNavigate("invoices")} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Back to Invoices
          </button>
        </div>

        {message && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "18px",
            background: message.type === "error" ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${message.type === "error" ? "#fca5a5" : "#86efac"}`,
            color: message.type === "error" ? "#991b1b" : "#166534",
            fontWeight: 500,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <CheckCircle size={18} />
            {message.text}
          </div>
        )}

        <div className="horizontal-timeline">
          <div className="timeline-node done">Order Confirmed</div>
          <div className="timeline-node done">Shipped</div>
          <div className={`timeline-node ${paid ? "done" : "current"}`}>Invoiced</div>
          <div className={`timeline-node ${paid ? "done" : ""}`}>Paid</div>
        </div>

        <div className="table-wrapper" style={{ marginTop: "24px" }}>
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>{current.id || "Invoice"}</td>
                <td style={{ fontWeight: 600 }}>{amountDisplay || "₹0"}</td>
                <td>
                  <span className={`badge ${paid ? "green" : "red"}`}>
                    {paid ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td>{current.dueDate}</td>
                <td>{current.type || "One-Time"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="button-row" style={{ marginTop: "24px", display: 'flex', gap: '12px' }}>
          {!paid && currentUser?.role !== 'salesperson' ? (
            <button className="btn-primary" onClick={handleRecordPayment} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={16} />
              <span>Record Payment</span>
            </button>
          ) : paid ? (
            <button className="btn-primary" disabled style={{ background: '#299b45', borderColor: '#299b45', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} />
              <span>Payment Captured</span>
            </button>
          ) : null}
          <button className="btn-outline" onClick={handleDownloadInvoice} disabled={loading || !current._id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} />
            <span>Download Invoice (PDF)</span>
          </button>
        </div>

        <div className="info-box" style={{ marginTop: "20px" }}>
          Partial invoicing stays reconciled with partial delivery, waiting to bill future shipments. Download Invoice streams the immutable PDF audit record.
        </div>
      </div>
    </main>
  );
}
