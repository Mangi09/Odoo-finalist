import React from "react";
import "../App.css";

export default function DealHealthPage({ onNavigate }) {
  const anomalies = [
    { deal: "Q-1042", customer: "Acme Corp", reason: "No reply in 5 days", flagged: "Aug 21", owner: "Sales Manager" },
    { deal: "Q-1038", customer: "Nova Retail", reason: "Budget not confirmed", flagged: "Aug 20", owner: "Finance" },
    { deal: "Q-1039", customer: "Beta Industries", reason: "Escalated to Manager", flagged: "Aug 18", owner: "Account Manager" },
  ];

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header">
          <div className="page-header-left">
            <span className="ops-label">Deal Health Dashboard</span>
            <h1>Deal Health and Anomaly Dashboard</h1>
            <p className="subtitle">Monitor flagged deals, stalled quotes and unusual discount patterns.</p>
          </div>
        </div>

        <div className="mini-card-grid">
          <div className="mini-card"><div className="mini-card-title">Stalled Deals</div><div className="mini-card-value">3 quotes over 7 days</div></div>
          <div className="mini-card"><div className="mini-card-title">Discount Anomalies</div><div className="mini-card-value">2 above average</div></div>
          <div className="mini-card"><div className="mini-card-title">Delivery Slippage</div><div className="mini-card-value">1 partial delay</div></div>
        </div>
      </div>

      <div className="page-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Deal</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Flagged</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((row) => (
                <tr key={row.deal} onClick={() => onNavigate && onNavigate("quotation-detail", { id: row.deal, customer: row.customer })}>
                  <td>{row.deal}</td>
                  <td>{row.customer}</td>
                  <td>{row.reason}</td>
                  <td>{row.flagged}</td>
                  <td>{row.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="button-row" style={{ marginTop: "20px" }}>
          <button className="btn-danger">Escalate</button>
          <button className="btn-primary">Assign Rep</button>
        </div>
      </div>
    </main>
  );
}
