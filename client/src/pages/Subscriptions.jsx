import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { RefreshCw } from "lucide-react";

const defaultSubscriptions = [
  { id: "SUB-101", customer: "Acme Corp", plan: "Care Plan 2yr", cycle: "Monthly", nextBill: "Sep 15", status: "Active", amount: 499 },
  { id: "SUB-102", customer: "Beta Industries", plan: "Support SLA", cycle: "Quarterly", nextBill: "Nov 1", status: "Active", amount: 1200 },
  { id: "SUB-103", customer: "Delta LLC", plan: "Care Plan 1yr", cycle: "Monthly", nextBill: "-", status: "Paused", amount: 299 },
  { id: "SUB-104", customer: "Nova Retail", plan: "NovaCloud Pro", cycle: "Yearly", nextBill: "Oct 20", status: "Active", amount: 3500 },
  { id: "SUB-105", customer: "Apex Systems", plan: "Enterprise Care", cycle: "Monthly", nextBill: "Sep 30", status: "Active", amount: 899 },
  { id: "SUB-106", customer: "Zenith Global", plan: "Basic SLA", cycle: "Monthly", nextBill: "-", status: "Cancelled", amount: 150 },
  { id: "SUB-107", customer: "CyberDyne Inc", plan: "Custom Support", cycle: "Yearly", nextBill: "Nov 15", status: "Active", amount: 4800 },
  { id: "SUB-108", customer: "Omni Consumer Products", plan: "Cloud Infrastructure", cycle: "Monthly", nextBill: "Oct 01", status: "Active", amount: 1500 },
];

function Subscriptions({ subscriptionsList, onNavigate, onSelectSubscription }) {
  const [subscriptions, setSubscriptions] = useState(subscriptionsList || defaultSubscriptions);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await api.subscriptions.getAll();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((s, idx) => ({
          _id: s._id,
          id: s.subscriptionNumber || `SUB-${String(idx + 101)}`,
          customer: s.customer || s.salesOrderId?.customer || "Customer Corp",
          plan: s.planName || s.productName || "Enterprise Care Plan",
          cycle: s.billingCycle ? s.billingCycle.charAt(0).toUpperCase() + s.billingCycle.slice(1).toLowerCase() : "Monthly",
          nextBill: s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Sep 15",
          status: s.status === 'ACTIVE' ? "Active" : (s.status === 'PAUSED' ? "Paused" : "Cancelled"),
          amount: s.amount || 499
        }));

        const existing = new Set(mapped.map(m => m.id));
        const combined = [...mapped, ...defaultSubscriptions.filter(d => !existing.has(d.id))];
        setSubscriptions(combined);
      }
    } catch (err) {
      console.warn("Subscriptions API fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = subscriptions.filter((s) => s.status.toLowerCase() === "active").length;
  const pausedCount = subscriptions.filter((s) => s.status.toLowerCase() === "paused").length;
  const cancelledCount = subscriptions.filter((s) => s.status.toLowerCase() === "cancelled").length;

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filter === "all") return true;
    return sub.status.toLowerCase() === filter.toLowerCase();
  });

  const handleRowClick = (sub) => {
    if (onSelectSubscription) onSelectSubscription(sub);
    if (onNavigate) onNavigate("billing-detail", sub);
  };

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="page-header-left">
            <span className="ops-label">Recurring Revenue</span>
            <h1>Subscriptions (MRR)</h1>
            <p className="subtitle">
              Recurring service agreements, billing schedules, and automated contract renewals.
            </p>
          </div>
          <button className="btn-outline" onClick={loadSubscriptions} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Status Counters */}
        <div className="status-container" style={{ cursor: "pointer" }}>
          <div
            className="status approved"
            onClick={() => setFilter(filter === "active" ? "all" : "active")}
            style={{ outline: filter === "active" ? "2px solid #299b45" : "none" }}
          >
            <span>{activeCount} Active</span>
          </div>

          <div
            className="status pending"
            onClick={() => setFilter(filter === "paused" ? "all" : "paused")}
            style={{ outline: filter === "paused" ? "2px solid #f49a00" : "none" }}
          >
            <span>{pausedCount} Paused</span>
          </div>

          <div
            className="status returned"
            onClick={() => setFilter(filter === "cancelled" ? "all" : "cancelled")}
            style={{ outline: filter === "cancelled" ? "2px solid #e82d32" : "none" }}
          >
            <span>{cancelledCount} Cancelled</span>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section" style={{ margin: "14px 0" }}>
          <label htmlFor="filter" style={{ marginRight: "8px", fontSize: "13px" }}>Filter Plan Status:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #cbd5e0" }}
          >
            <option value="all">All Subscriptions ({subscriptions.length})</option>
            <option value="active">Active Only ({activeCount})</option>
            <option value="paused">Paused Only ({pausedCount})</option>
            <option value="cancelled">Cancelled Only ({cancelledCount})</option>
          </select>
        </div>

        {/* Subscriptions Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Subscription ID</th>
                <th>Customer</th>
                <th>Service Plan</th>
                <th>Billing Cycle</th>
                <th>Next Billing</th>
                <th>Status</th>
                <th>MRR / Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub._id || sub.id} onClick={() => handleRowClick(sub)} style={{ cursor: "pointer" }}>
                  <td style={{ fontWeight: 600, color: "#1a365d" }}>{sub.id}</td>
                  <td>{sub.customer}</td>
                  <td>{sub.plan}</td>
                  <td>{sub.cycle}</td>
                  <td>{sub.nextBill}</td>
                  <td>
                    <span className={`badge ${sub.status.toLowerCase() === "active" ? "green" : (sub.status.toLowerCase() === "paused" ? "orange" : "red")}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{(sub.amount * 80).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box" style={{ marginTop: "20px" }}>
          Click any subscription row to inspect its recurring billing contract, payment history, and auto-renewal triggers.
        </div>
      </div>
    </main>
  );
}

export default Subscriptions;
