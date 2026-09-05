import React from 'react';
import { Plus } from 'lucide-react';

// Initial Mock Data
const stageGroups = [
  { title: "Draft", quotes: [{ id: "Q-1044", customer: "Acme Corp", amount: "$1,800" }, { id: "Q-1043", customer: "Delta LLC", amount: "$3,400" }] },
  { title: "Pending Approval", quotes: [{ id: "Q-1042", customer: "Acme Corp", amount: "$2,730" }] },
  { title: "Approved", quotes: [{ id: "Q-1040", customer: "Nova Retail", amount: "$9,750" }] },
  { title: "Negotiation", quotes: [{ id: "Q-1039", customer: "Beta Industries", amount: "$4,800" }] },
  { title: "Confirmed", quotes: [{ id: "Q-1038", customer: "Acme Corp", amount: "$680" }] },
];

export default function QuotationsPage({ onNavigate }) {
  return (
    <main className="content">
      <div className="page-card">
        <div className="quotations-page">
          {/* Header */}
          <div className="quotations-header">
            <div>
              <span className="ops-label">Sales Operations</span>
              <h1 className="page-title">Quotations</h1>
              <p className="page-subtitle">Create, track and manage quotations across your active deal pipeline.</p>
            </div>
            <button className="btn-primary">
              <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              New Quotation
            </button>
          </div>

          <div className="flow-board">
            {stageGroups.map((group) => (
              <section className="flow-column" key={group.title}>
                <h2>{group.title}</h2>
                {group.quotes.map((quote) => (
                  <button
                    type="button"
                    className="flow-record-card"
                    key={quote.id}
                    onClick={() => onNavigate && onNavigate("quotation-detail", { ...quote, status: group.title })}
                  >
                    <strong>{quote.id}</strong>
                    <span>{quote.customer}</span>
                    <small>{quote.amount}</small>
                  </button>
                ))}
              </section>
            ))}
          </div>

          <div className="button-row" style={{ marginTop: "20px" }}>
            <button className="btn-primary" onClick={() => onNavigate && onNavigate("quotation-detail", { id: "Q-1042", customer: "Acme Corp", status: "Draft" })}>New Quotation</button>
            <button className="btn-outline" onClick={() => onNavigate && onNavigate("customer-portal", { id: "Q-1042", customer: "Acme Corp" })}>Switch to Table View</button>
          </div>

          <div className="info-box" style={{ marginTop: "20px" }}>
            Click a quotation card to open its detail, product lines, discounts, and next actions.
          </div>
        </div>
      </div>
    </main>
  );
}
