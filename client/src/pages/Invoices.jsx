import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { RefreshCw } from "lucide-react";

function Invoices({ onNavigate }) {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await api.invoices.getAll();
      if (Array.isArray(data)) {
        const mapped = data.map(inv => ({
          _id: inv._id,
          id: inv.id,
          customer: inv.customer,
          salesperson: inv.salesperson,
          amount: inv.amount,
          rawAmount: inv.rawAmount,
          status: inv.status,
          dueDate: inv.dueDate,
          type: inv.type,
          salesOrderId: inv.salesOrderId
        }));
        setInvoices(mapped);
      }
    } catch (err) {
      console.warn("Could not load invoices:", err.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const unpaidCount = invoices.filter((i) => i.status.toLowerCase() === "unpaid").length;
  const paidCount = invoices.filter((i) => i.status.toLowerCase() === "paid").length;

  const filteredInvoices = invoices.filter((inv) => {
    const text = `${inv.id} ${inv.customer} ${inv.salesperson} ${inv.amount} ${inv.status} ${inv.type}`.toLowerCase();
    return (filter === "all" || inv.status.toLowerCase() === filter.toLowerCase())
      && (typeFilter === "all" || inv.type === typeFilter)
      && text.includes(searchFilter.toLowerCase());
  });

  const handleRowClick = (inv) => onNavigate && onNavigate("invoice-detail", inv);

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="page-header-left">
            <span className="ops-label">Billing Operations</span>
            <h1>Invoices Ledger</h1>
            <p className="subtitle">
              Tax invoice generation, payment collections, and accounting ledger tracking.
            </p>
          </div>
          <button className="btn-outline" onClick={loadInvoices} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Status Counters */}
        <div className="status-container" style={{ cursor: "pointer" }}>
          <div
            className="status returned"
            onClick={() => setFilter(filter === "unpaid" ? "all" : "unpaid")}
            style={{ outline: filter === "unpaid" ? "2px solid #e82d32" : "none" }}
          >
            <span>{unpaidCount} Unpaid</span>
          </div>

          <div
            className="status approved"
            onClick={() => setFilter(filter === "paid" ? "all" : "paid")}
            style={{ outline: filter === "paid" ? "2px solid #299b45" : "none" }}
          >
            <span>{paidCount} Paid</span>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section" style={{ margin: "14px 0" }}>
          <label htmlFor="filter" style={{ marginRight: "8px", fontSize: "13px" }}>Filter Status:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #cbd5e0" }}
          >
            <option value="all">All Invoices ({invoices.length})</option>
            <option value="unpaid">Unpaid Only ({unpaidCount})</option>
            <option value="paid">Paid Only ({paidCount})</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ marginLeft: "8px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #cbd5e0" }}
          >
            <option value="all">All Types</option>
            {[...new Set(invoices.map(inv => inv.type).filter(Boolean))].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by invoice, customer, salesperson..."
            style={{ marginLeft: "8px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #cbd5e0", minWidth: "220px" }}
          />
        </div>

        {/* Invoice Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Salesperson</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Type</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv._id || inv.id} onClick={() => handleRowClick(inv)} style={{ cursor: "pointer" }}>
                  <td style={{ fontWeight: 600, color: "#1a365d" }}>{inv.id}</td>
                  <td>{inv.customer}</td>
                  <td>{inv.salesperson || "Unassigned"}</td>
                  <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                  <td>
                    <span className={`badge ${inv.status.toLowerCase() === "paid" ? "green" : "red"}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>{inv.dueDate}</td>
                  <td>{inv.type || "One-Time"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Information Box */}
        <div className="info-box" style={{ marginTop: "20px" }}>
          Click an invoice row to open its full payment, PDF generation, and delivery reconciliation detail.
        </div>
      </div>
    </main>
  );
}

export default Invoices;
