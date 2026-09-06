import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const emptyStageGroups = () => [
  { title: "Draft", quotes: [] }, { title: "Pending Approval", quotes: [] },
  { title: "Approved", quotes: [] }, { title: "Negotiation", quotes: [] }, { title: "Confirmed", quotes: [] },
];

export default function QuotationsPage({ onNavigate }) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [stageGroups, setStageGroups] = useState(emptyStageGroups);
  const [allQuotes, setAllQuotes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const currentRole = (() => {
    try {
      return JSON.parse(localStorage.getItem('dealflow-user') || '{}')?.role;
    } catch {
      return null;
    }
  })();
  const canManageQuotation = ['salesperson', 'sales_manager', 'admin'].includes(currentRole);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const data = await api.quotations.getAll();
      if (Array.isArray(data)) {
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

        const groups = emptyStageGroups();

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
            salesperson: q.salespersonId?.name || 'Unassigned',
          });
        });

        setStageGroups(groups);
      }
    } catch (err) {
      console.warn('Could not load quotations:', err.message);
      setAllQuotes([]);
      setStageGroups(emptyStageGroups());
    } finally {
      setLoading(false);
    }
  };

  const archiveQuotation = async (quote, e) => {
    e.stopPropagation();
    if (!quote?._id || !window.confirm(`Archive quotation ${quote.id || quote._id}?`)) return;
    try {
      await api.quotations.archive(quote._id);
      await loadQuotations();
    } catch (err) {
      window.alert(err.message || 'Could not archive quotation');
    }
  };

  const deleteQuotation = async (quote, e) => {
    e.stopPropagation();
    if (!quote?._id || !window.confirm(`Delete quotation ${quote.id || quote._id}? This cannot be undone.`)) return;
    try {
      await api.quotations.delete(quote._id);
      await loadQuotations();
    } catch (err) {
      window.alert(err.message || 'Could not delete quotation');
    }
  };

  const matchesQuoteFilter = (quote) => {
    const status = quote.status || quote.rawStatus || "";
    const customer = quote.customerId?.name || quote.customerId?.companyName || quote.customer || "";
    const salesperson = quote.salespersonId?.name || quote.salesperson || "";
    const id = quote.quotationNumber || quote.id || "";
    const text = `${id} ${customer} ${salesperson} ${status}`.toLowerCase();
    return (statusFilter === "all" || status === statusFilter) && text.includes(searchFilter.toLowerCase());
  };
  const tableList = allQuotes.filter(matchesQuoteFilter);
  const visibleStageGroups = stageGroups.map(group => ({
    ...group,
    quotes: group.quotes.filter(quote => {
      const raw = quote.rawQuote || quote;
      return matchesQuoteFilter(raw);
    })
  }));

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
                onClick={() => onNavigate && onNavigate("quotation-detail", {})}
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

          <div className="filter-section" style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "14px 0" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "13px" }}
            >
              <option value="all">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="SENT_TO_CUSTOMER">Sent</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="RE_APPROVAL">Re-Approval</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by quote, customer, salesperson..."
              style={{ flex: 1, minWidth: "220px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "13px" }}
            />
          </div>

          {/* Kanban Board View */}
          {viewMode === 'kanban' ? (
            <div className="flow-board">
              {visibleStageGroups.map((group) => (
                <section className="flow-column" key={group.title}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{ margin: 0 }}>{group.title}</h2>
                    <span style={{ fontSize: '12px', background: '#e2e8f0', color: '#4a5568', padding: '2px 7px', borderRadius: '10px', fontWeight: 600 }}>
                      {group.quotes.length}
                    </span>
                  </div>
                  {group.quotes.map((quote) => (
                    <div
                      className="flow-record-card"
                      key={quote.id}
                      onClick={() => onNavigate && onNavigate("quotation-detail", { ...quote, status: group.title })}
                      role="button"
                      tabIndex={0}
                    >
                      <strong>{quote.id}</strong>
                      <span>{quote.customer}</span>
                      <small>{quote.amount}</small>
                      {canManageQuotation && (
                        <span style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          <button type="button" className="btn-outline" style={{ padding: '2px 6px', fontSize: '11px' }} onClick={(e) => archiveQuotation(quote, e)}>Archive</button>
                          <button type="button" className="btn-outline" style={{ padding: '2px 6px', fontSize: '11px', color: '#dc2626', borderColor: '#fca5a5' }} onClick={(e) => deleteQuotation(quote, e)}>Delete</button>
                        </span>
                      )}
                    </div>
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
                    <th>Salesperson</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableList.map((quote, idx) => {
                    const custName = quote.customerId?.name || quote.customer || 'Customer';
                    const qId = quote.quotationNumber || quote.id || (quote._id ? `Q-${quote._id.toString().slice(-4).toUpperCase()}` : `Q-${idx + 1040}`);
                    const amt = quote.totalAmount ? `₹${quote.totalAmount.toLocaleString('en-IN')}` : (quote.amount || '₹0');
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
                        <td>{quote.salesperson || 'Unassigned'}</td>
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
                          {canManageQuotation && (
                            <>
                              <button
                                type="button"
                                className="btn-outline"
                                style={{ padding: '3px 10px', fontSize: '11px', marginLeft: '6px' }}
                                onClick={(e) => archiveQuotation(quote, e)}
                              >
                                Archive
                              </button>
                              <button
                                type="button"
                                className="btn-outline"
                                style={{ padding: '3px 10px', fontSize: '11px', marginLeft: '6px', color: '#dc2626', borderColor: '#fca5a5' }}
                                onClick={(e) => deleteQuotation(quote, e)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}


          <div className="info-box" style={{ marginTop: "20px" }}>
            Click any quotation card or table row to open its line items, discount margins, upsell suggestions, and submission workflow.
          </div>
        </div>
      </div>
    </main>
  );
}
