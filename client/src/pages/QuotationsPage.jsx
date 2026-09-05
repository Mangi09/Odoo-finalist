import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const initialStageGroups = [
  { title: "Draft", quotes: [{ id: "Q-1044", customer: "Acme Corp", amount: "₹1,80,000", totalAmount: 180000 }] },
  { title: "Pending Approval", quotes: [{ id: "Q-1042", customer: "Acme Corp", amount: "₹2,73,000", totalAmount: 273000 }] },
  { title: "Approved", quotes: [{ id: "Q-1040", customer: "Nova Retail", amount: "₹9,75,000", totalAmount: 975000 }] },
  { title: "Negotiation", quotes: [{ id: "Q-1039", customer: "Beta Industries", amount: "₹4,80,000", totalAmount: 480000 }] },
  { title: "Confirmed", quotes: [{ id: "Q-1038", customer: "Acme Corp", amount: "₹68,000", totalAmount: 68000 }] },
];

export default function QuotationsPage({ onNavigate }) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [stageGroups, setStageGroups] = useState(initialStageGroups);
  const [allQuotes, setAllQuotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const data = await api.quotations.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setAllQuotes(data);

        // Group by status
        const statusMap = {
          'DRAFT': 'Draft',
          'PENDING_APPROVAL': 'Pending Approval',
          'APPROVED': 'Approved',
          'SENT_TO_CUSTOMER': 'Negotiation',
          'NEGOTIATION': 'Negotiation',
          'RE_APPROVAL': 'Pending Approval',
          'ACCEPTED': 'Confirmed',
          'CONFIRMED': 'Confirmed',
        };

        const groups = [
          { title: "Draft", quotes: [] },
          { title: "Pending Approval", quotes: [] },
          { title: "Approved", quotes: [] },
          { title: "Negotiation", quotes: [] },
          { title: "Confirmed", quotes: [] },
        ];

        data.forEach(q => {
          const groupTitle = statusMap[q.status] || 'Draft';
          const targetGroup = groups.find(g => g.title === groupTitle) || groups[0];
          const custName = q.customerId?.name || q.customerId?.companyName || q.customer || 'Customer';
          const amountStr = q.totalAmount ? `₹${q.totalAmount.toLocaleString('en-IN')}` : (q.amount || '₹0');

          targetGroup.quotes.push({
            id: q.quotationNumber || (q._id ? `Q-${q._id.toString().slice(-4).toUpperCase()}` : q.id),
            _id: q._id,
            customer: custName,
            amount: amountStr,
            rawQuote: q,
            status: groupTitle,
            updatedAt: q.updatedAt || q.createdAt,
          });
        });

        // Ensure every group has at least initial mock if empty in dev
        initialStageGroups.forEach(initGroup => {
          const matching = groups.find(g => g.title === initGroup.title);
          if (matching && matching.quotes.length === 0) {
            matching.quotes = initGroup.quotes;
          }
        });

        setStageGroups(groups);
      } else {
        // Fallback to initial mock list
        const flattened = initialStageGroups.flatMap(g => g.quotes.map(q => ({ ...q, status: g.title })));
        setAllQuotes(flattened);
      }
    } catch (err) {
      console.warn('Could not load live quotations, using seeded fallback:', err.message);
      const flattened = initialStageGroups.flatMap(g => g.quotes.map(q => ({ ...q, status: g.title })));
      setAllQuotes(flattened);
    } finally {
      setLoading(false);
    }
  };

  const tableList = allQuotes.length > 0 ? allQuotes : stageGroups.flatMap(g => g.quotes.map(q => ({ ...q, status: g.title })));

  return (
    <main className="content">
      <div className="page-card">
        <div className="quotations-page">
          {/* Header */}
          <div className="quotations-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="ops-label">Sales Operations</span>
              <h1 className="page-title">Quotations</h1>
              <p className="page-subtitle">Create, track and manage quotations across your active deal pipeline.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {viewMode === 'kanban' ? (
                  <>
                    <List size={16} />
                    <span>Table View</span>
                  </>
                ) : (
                  <>
                    <LayoutGrid size={16} />
                    <span>Kanban View</span>
                  </>
                )}
              </button>
              <button
                className="btn-primary"
                onClick={() => onNavigate && onNavigate("quotation-detail", { id: "Q-NEW", customer: "New Customer", status: "Draft" })}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={18} />
                <span>New Quotation</span>
              </button>
            </div>
          </div>

          {loading && (
            <div style={{ padding: '12px', fontSize: '13px', color: '#718096', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={14} className="spin" /> Loading quotations...
            </div>
          )}

          {/* Kanban Board View */}
          {viewMode === 'kanban' ? (
            <div className="flow-board">
              {stageGroups.map((group) => (
                <section className="flow-column" key={group.title}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{ margin: 0 }}>{group.title}</h2>
                    <span style={{ fontSize: '12px', background: '#e2e8f0', color: '#4a5568', padding: '2px 7px', borderRadius: '10px', fontWeight: 600 }}>
                      {group.quotes.length}
                    </span>
                  </div>
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
          ) : (
            /* Table View */
            <div className="table-wrapper" style={{ marginTop: '16px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Quotation #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableList.map((quote, idx) => {
                    const custName = quote.customerId?.name || quote.customer || 'Acme Corp';
                    const qId = quote.quotationNumber || quote.id || (quote._id ? `Q-${quote._id.toString().slice(-4).toUpperCase()}` : `Q-${idx + 1040}`);
                    const amt = quote.totalAmount ? `₹${quote.totalAmount.toLocaleString('en-IN')}` : (quote.amount || '₹2,73,000');
                    const st = quote.status || 'Draft';
                    const dateStr = quote.updatedAt ? new Date(quote.updatedAt).toLocaleDateString() : 'Recent';

                    const badgeClass =
                      st.toLowerCase().includes('confirm') ? 'green' :
                      st.toLowerCase().includes('approv') ? 'orange' :
                      st.toLowerCase().includes('nego') ? 'blue' : 'gray';

                    return (
                      <tr
                        key={qId}
                        onClick={() => onNavigate && onNavigate("quotation-detail", { id: qId, customer: custName, amount: amt, status: st, ...quote })}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ fontWeight: 600, color: '#1a365d' }}>{qId}</td>
                        <td>{custName}</td>
                        <td style={{ fontWeight: 600 }}>{amt}</td>
                        <td><span className={`badge ${badgeClass}`}>{st}</span></td>
                        <td>{dateStr}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-outline"
                            style={{ padding: '3px 10px', fontSize: '11px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate && onNavigate("quotation-detail", { id: qId, customer: custName, amount: amt, status: st, ...quote });
                            }}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="button-row" style={{ marginTop: "20px", display: 'flex', gap: '10px' }}>
            <button
              className="btn-primary"
              onClick={() => onNavigate && onNavigate("quotation-detail", { id: "Q-1042", customer: "Acme Corp", status: "Draft" })}
            >
              New Quotation
            </button>
            <button
              className="btn-outline"
              onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
            >
              {viewMode === 'kanban' ? 'Switch to Table View' : 'Switch to Kanban View'}
            </button>
            <button
              className="btn-outline"
              onClick={() => onNavigate && onNavigate("customer-portal", { id: "Q-1042", customer: "Acme Corp" })}
              title="Preview how customer sees this quotation"
            >
              Customer Portal Preview
            </button>
          </div>

          <div className="info-box" style={{ marginTop: "20px" }}>
            Click any quotation card or table row to open its line items, discount margins, upsell suggestions, and submission workflow.
          </div>
        </div>
      </div>
    </main>
  );
}
