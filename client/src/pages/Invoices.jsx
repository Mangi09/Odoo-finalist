import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { RefreshCw } from "lucide-react";

const defaultInvoices = [
  { id: "INV-1042", customer: "Acme Corp", amount: "₹2,73,000", status: "Unpaid", dueDate: "Sep 10", type: "One-Time" },
  { id: "INV-1043", customer: "Acme Corp", amount: "₹4,600", status: "Paid", dueDate: "Sep 15", type: "Recurring" },
  { id: "INV-1038", customer: "Nova Retail", amount: "₹9,75,000", status: "Paid", dueDate: "Aug 30", type: "One-Time" },
  { id: "INV-1044", customer: "Beta Industries", amount: "₹1,20,000", status: "Unpaid", dueDate: "Oct 01", type: "Recurring" },
  { id: "INV-1045", customer: "Delta LLC", amount: "₹3,40,000", status: "Paid", dueDate: "Jul 20", type: "One-Time" },
  { id: "INV-1046", customer: "Apex Systems", amount: "₹89,900", status: "Paid", dueDate: "Sep 01", type: "Recurring" },
  { id: "INV-1047", customer: "CyberDyne Inc", amount: "₹4,80,000", status: "Unpaid", dueDate: "Nov 15", type: "Recurring" },
  { id: "INV-1048", customer: "Omni Consumer Products", amount: "₹1,50,000", status: "Paid", dueDate: "Aug 15", type: "Recurring" },
  { id: "INV-1049", customer: "Stark Logistics", amount: "₹2,20,000", status: "Paid", dueDate: "Sep 05", type: "Recurring" },
  { id: "INV-1050", customer: "Wayne Tech", amount: "₹5,00,000", status: "Paid", dueDate: "Aug 10", type: "Recurring" },
];

function Invoices({ onNavigate }) {
  const [invoices, setInvoices] = useState(defaultInvoices);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await api.invoices.getAll();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(inv => ({
          _id: inv._id,
          id: inv.id || `INV-${inv._id.toString().slice(-4).toUpperCase()}`,
          customer: inv.customer || "Acme Corp",
          amount: inv.amount || "₹2,73,000",
          rawAmount: inv.rawAmount,
          status: inv.status || "Unpaid",
          dueDate: inv.dueDate || "Net 30",
          type: inv.type || "One-Time",
          salesOrderId: inv.salesOrderId
        }));

        const existingIds = new Set(mapped.map(m => m.id));
        const combined = [...mapped, ...defaultInvoices.filter(d => !existingIds.has(d.id))];
        setInvoices(combined);
      }
    } catch (err) {
      console.warn("Invoices API fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const unpaidCount = invoices.filter((i) => i.status.toLowerCase() === "unpaid").length;
  const paidCount = invoices.filter((i) => i.status.toLowerCase() === "paid").length;

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "all") return true;
    return inv.status.toLowerCase() === filter.toLowerCase();
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
        </div>

        {/* Invoice Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
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
