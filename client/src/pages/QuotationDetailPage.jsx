import React, { useState } from "react";
import "../App.css";
import { ArrowLeft, CheckCircle2, Send, ExternalLink, Save } from "lucide-react";

const initialLines = [
  { product: "Laptop Pro 14", qty: 2, price: "₹1,20,000", discount: "5%", limit: "15%", status: "OK" },
  { product: "Onsite Setup Service", qty: 1, price: "₹50,000", discount: "18%", limit: "10%", status: "OVER - High" },
  { product: "Extended Warranty", qty: 1, price: "₹9,000", discount: "10%", limit: "10%", status: "OK" },
];

export default function QuotationDetailPage({ onNavigate, quote }) {
  const [notice, setNotice] = useState("");
  const quoteId = quote?.quotationNumber || quote?.id || "Q-1042";
  const customer = quote?.customer || quote?.customerId?.name || "Acme Corp";
  const title = `${quoteId} (${customer})`;

  const handleSubmitApproval = () => {
    setNotice(`Quotation ${quoteId} submitted to Sales Manager for discount exception review.`);
    setTimeout(() => {
      if (onNavigate) {
        onNavigate("approvals", {
          quotation: quoteId,
          customer: customer,
          risk: "HIGH",
          stage: "Sales Manager",
          assigned: "M. Shah",
          requestedDiscount: "18%",
          allowedDiscount: "10%",
        });
      }
    }, 800);
  };

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div className="page-header-left">
            <span className="ops-label">Quotation Configuration</span>
            <h1 style={{ margin: "4px 0" }}>Quotation Detail: {title}</h1>
            <p className="subtitle">Add products, configure line-item discounts, and evaluate real-time margin rules.</p>
          </div>
          <button className="btn-outline" onClick={() => onNavigate && onNavigate("quotations")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={16} /> Back to Quotations
          </button>
        </div>

        {notice && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            background: "#f0fdf4",
            border: "1px solid #86efac",
            color: "#166534",
            fontWeight: 500,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <CheckCircle2 size={18} />
            {notice}
          </div>
        )}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Line Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Limit Ceiling</th>
                <th>Validation Status</th>
              </tr>
            </thead>
            <tbody>
              {initialLines.map((line) => (
                <tr key={line.product}>
                  <td style={{ fontWeight: 600, color: "#1a365d" }}>{line.product}</td>
                  <td>{line.qty}</td>
                  <td>{line.price}</td>
                  <td style={{ fontWeight: 600 }}>{line.discount}</td>
                  <td>{line.limit}</td>
                  <td>
                    <span className={`badge ${line.status.includes("OVER") ? "red" : "green"}`}>
                      {line.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box" style={{ marginTop: "18px" }}>
          Automated rule engine: Line 2 exceeds the 10% Service discount ceiling by 8 points, automatically requiring Level-1 Sales Manager approval before customer submission.
        </div>
      </div>

      <div className="page-card">
        <h2>Upsell & Cross-Sell AI Recommendations</h2>
        <div className="mini-card-grid">
          <div className="mini-card">
            <div className="mini-card-title">Wireless Ergonomic Mouse</div>
            <div className="mini-card-value">Margin: 47%</div>
            <small style={{ color: "#64748b" }}>Recommended with Laptop Pro</small>
          </div>
          <div className="mini-card">
            <div className="mini-card-title">Thunderbolt Docking Station</div>
            <div className="mini-card-value">Bundle: 18% lift</div>
            <small style={{ color: "#64748b" }}>Frequently co-purchased</small>
          </div>
          <div className="mini-card">
            <div className="mini-card-title">Enterprise Care Plan 2yr</div>
            <div className="mini-card-value">Margin: 40% (MRR)</div>
            <small style={{ color: "#64748b" }}>Boosts recurring revenue</small>
          </div>
        </div>

        <div className="button-row" style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn-outline" onClick={() => setNotice("Quotation draft updated and saved.")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Save size={15} />
            <span>Save Draft</span>
          </button>
          <button className="btn-primary" onClick={handleSubmitApproval} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Send size={15} />
            <span>Submit for Approval</span>
          </button>
          <button
            className="btn-outline"
            onClick={() => onNavigate && onNavigate("customer-portal", { id: quoteId, customer: customer, total: "₹2,73,000", status: "Negotiation" })}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ExternalLink size={15} />
            <span>Open in Customer Portal</span>
          </button>
        </div>
      </div>
    </main>
  );
}
