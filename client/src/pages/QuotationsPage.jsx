import React from 'react';

const stages = ["Draft", "Pending Approval", "Approved", "Negotiation", "Confirmed"];

export default function QuotationsPage({ onNavigate, quotations = [] }) {
  const stageGroups = stages.map((stage) => ({
    title: stage,
    quotes: quotations.filter((quote) => quote.status === stage),
  }));

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

          <div className="info-box" style={{ marginTop: "20px" }}>
            Click a quotation card to open its detail, product lines, discounts, and next actions.
          </div>
        </div>
      </div>
    </main>
  );
}
