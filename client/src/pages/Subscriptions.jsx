import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { RefreshCw } from "lucide-react";

function Subscriptions({ subscriptionsList, onNavigate, onSelectSubscription }) {
  const [subscriptions, setSubscriptions] = useState(subscriptionsList || []);
  const [filter, setFilter] = useState("all");
  const [cycleFilter, setCycleFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await api.subscriptions.getAll();
      if (Array.isArray(data)) {
        const mapped = data.map((s, idx) => ({
          _id: s._id,
          id: s.id,
          customer: s.customer,
          plan: s.plan,
          cycle: s.cycle,
          nextBill: s.nextBill,
          status: s.status,
          amount: s.amount,
          salesperson: s.salesperson
        }));
        setSubscriptions(mapped);
      }
    } catch (err) {
      console.warn("Could not load subscriptions:", err.message);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = subscriptions.filter((s) => s.status.toLowerCase() === "active").length;
  const pausedCount = subscriptions.filter((s) => s.status.toLowerCase() === "paused").length;
  const cancelledCount = subscriptions.filter((s) => s.status.toLowerCase() === "cancelled").length;

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const text = `${sub.id} ${sub.customer} ${sub.salesperson} ${sub.plan} ${sub.cycle} ${sub.status}`.toLowerCase();
    return (filter === "all" || sub.status.toLowerCase() === filter.toLowerCase())
      && (cycleFilter === "all" || sub.cycle === cycleFilter)
      && text.includes(searchFilter.toLowerCase());
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
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            style={{ marginLeft: "8px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #cbd5e0" }}
          >
            <option value="all">All Cycles</option>
            {[...new Set(subscriptions.map(sub => sub.cycle).filter(Boolean))].map(cycle => (
              <option key={cycle} value={cycle}>{cycle}</option>
            ))}
          </select>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by subscription, customer, salesperson, plan..."
            style={{ marginLeft: "8px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #cbd5e0", minWidth: "220px" }}
          />
        </div>

        {/* Subscriptions Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Subscription ID</th>
                <th>Customer</th>
                <th>Salesperson</th>
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
                  <td>{sub.salesperson || 'Unassigned'}</td>
                  <td>{sub.plan}</td>
                  <td>{sub.cycle}</td>
                  <td>{sub.nextBill}</td>
                  <td>
                    <span className={`badge ${sub.status.toLowerCase() === "active" ? "green" : (sub.status.toLowerCase() === "paused" ? "orange" : "red")}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{Number(sub.amount || 0).toLocaleString('en-IN')}</td>
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
