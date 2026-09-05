import React, { useState } from "react";
import "../App.css";

export default function InvoiceDetailPage({ invoice, onNavigate }) {
  const [paid, setPaid] = useState(invoice?.status === "Paid");
  const current = invoice || { id: "INV-1042", customer: "Acme Corp", amount: "$2,730", status: "Unpaid", dueDate: "Sep 10", type: "One-Time" };

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header">
          <div className="page-header-left">
            <span className="ops-label">Invoice Detail</span>
            <h1>Invoice Detail: {current.id} ({current.customer})</h1>
            <p className="subtitle">Opened by clicking a row on the Invoices list.</p>
          </div>
          <button className="btn-outline" onClick={() => onNavigate && onNavigate("invoices")}>Back to Invoices</button>
        </div>

        <div className="horizontal-timeline">
          <div className="timeline-node done">Order Confirmed</div>
          <div className="timeline-node done">Shipped</div>
          <div className={`timeline-node ${paid ? "done" : "current"}`}>Invoiced</div>
          <div className={`timeline-node ${paid ? "done" : ""}`}>Paid</div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{current.id}</td>
                <td>{current.amount}</td>
                <td><span className={`badge ${paid ? "green" : "red"}`}>{paid ? "Paid" : current.status}</span></td>
                <td>{current.dueDate}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="button-row" style={{ marginTop: "20px" }}>
          <button className="btn-primary" onClick={() => setPaid(true)}>Record Payment</button>
          <button className="btn-outline">Download Invoice</button>
        </div>

        <div className="info-box" style={{ marginTop: "20px" }}>
          Partial invoicing stays reconciled with partial delivery, waiting to bill future shipments.
        </div>
      </div>
    </main>
  );
}
