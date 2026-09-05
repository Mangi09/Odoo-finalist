import React, { useState } from "react";
import "../App.css";

const quoteLines = [
  { product: "Laptop Pro 14", qty: 2, price: "$1,200", discount: "5%", limit: "15%", status: "OK" },
  { product: "Onsite Setup Service", qty: 1, price: "$500", discount: "18%", limit: "10%", status: "OVER - High" },
  { product: "Extended Warranty", qty: 1, price: "$90", discount: "10%", limit: "10%", status: "OK" },
];

export default function QuotationDetailPage({ onNavigate, quote }) {
  const [notice, setNotice] = useState("");
  const title = `${quote?.id || "Q-1042"} (${quote?.customer || "Acme Corp"})`;

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header">
          <div className="page-header-left">
            <span className="ops-label">Quotation Detail</span>
            <h1>Quotation Detail: {title}</h1>
            <p className="subtitle">Opened by clicking a row in the Quotations list. Add products, apply discounts, review quotes.</p>
          </div>
          <input type="text" defaultValue={title} aria-label="Quotation title" />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Limit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {quoteLines.map((line) => (
                <tr key={line.product}>
                  <td>{line.product}</td>
                  <td>{line.qty}</td>
                  <td>{line.price}</td>
                  <td>{line.discount}</td>
                  <td>{line.limit}</td>
                  <td><span className={`badge ${line.status.includes("OVER") ? "red" : "green"}`}>{line.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box" style={{ marginTop: "18px" }}>
          Discount is checked against each line's own limit, as soon as it is entered, and by full order mix.
        </div>
      </div>

      <div className="page-card">
        <h2>Upsell and Cross-Sell Suggestions</h2>
        <div className="mini-card-grid">
          <div className="mini-card"><div className="mini-card-title">Wireless Mouse</div><div className="mini-card-value">Margin: 47%</div></div>
          <div className="mini-card"><div className="mini-card-title">Docking Station</div><div className="mini-card-value">Often: 18% of deals</div></div>
          <div className="mini-card"><div className="mini-card-title">Care Plan 2yr</div><div className="mini-card-value">Margin: 40%</div></div>
        </div>
        <div className="button-row" style={{ marginTop: "18px" }}>
          <button className="btn-outline" onClick={() => setNotice("Draft saved.")}>Save Draft</button>
          <button className="btn-primary" onClick={() => onNavigate && onNavigate("approvals", { quotation: "Q-1042", customer: "Acme Corp", risk: "HIGH", stage: "Sales Manager", assigned: "M. Shah" })}>Submit for Approval</button>
        </div>
        {notice && <div className="info-box" style={{ marginTop: "18px" }}>{notice}</div>}
      </div>
    </main>
  );
}
