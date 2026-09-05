import React from "react";
import "../App.css";

export default function ApprovalDetail({ data, onNavigate }) {
  const quoteTitle = data ? `${data.quotation} (${data.customer})` : "Q-1042 (Acme Corp)";
  const risk = data ? data.risk : "HIGH";

  const lines = [
    { line: "Laptop (Hardware)", given: "12%", limit: "15%", over: "0 pt - OK" },
    { line: "Setup Service (Services)", given: "18%", limit: "10%", over: "8 pt OVER" },
  ];

  const history = [
    { user: "J. Rao", action: "Submitted", date: "Aug 20", note: "Initial 12% discount" },
    { user: "M. Shah", action: "Returned", date: "Aug 21", note: "Requested justification" },
    { user: "J. Rao", action: "Resubmitted", date: "Aug 22", note: "Added margin note" },
  ];

  return (
    <main className="content">
      <div className="page-card">
        <h1>Approval Detail: {quoteTitle}</h1>
        <p className="subtitle">
          Opened by clicking a row on the Approvals list
        </p>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <div style={{ background: "#e53e3e", color: "white", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", fontWeight: "600", border: "1px solid #c53030" }}>
            Blended Risk: {risk}
          </div>
          <div style={{ background: "#3182ce", color: "white", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", fontWeight: "600", border: "1px solid #2b6cb0" }}>
            Customer Tier: Gold
          </div>
        </div>

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
                <th>Over By</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.line}</td>
                  <td>{item.given}</td>
                  <td>{item.limit}</td>
                  <td>{item.over}</td>
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
          {/* Connecting Line */}
          <div style={{ position: "absolute", top: "20px", left: "40px", right: "40px", height: "4px", background: "#cbd5e0", zIndex: 0 }}></div>
          
          {/* Nodes */}
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
                  <td>{item.user}</td>
                  <td>{item.action}</td>
                  <td>{item.date}</td>
                  <td>{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="button-row" style={{ gap: "16px", marginTop: "24px" }}>
          <button className="btn-primary" onClick={() => onNavigate && onNavigate("fulfillment-list", { order: "Q-1042", customer: "Acme Corp", status: "Split Pending", warehouses: "Main + East Depot" })}>
            Approve
          </button>
          <button className="btn-secondary">
            Return for Revision
          </button>
          <button className="btn-outline">
            Reject
          </button>
        </div>
      </div>
    </main>
  );
}
