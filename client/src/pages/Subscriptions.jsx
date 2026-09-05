import React, { useState } from "react";
import "../App.css";

const defaultSubscriptions = [
  { id: "SUB-101", customer: "Acme Corp", plan: "Care Plan 2yr", cycle: "Monthly", nextBill: "Sep 15", status: "Active", amount: 499 },
  { id: "SUB-102", customer: "Beta Industries", plan: "Support SLA", cycle: "Quarterly", nextBill: "Nov 1", status: "Active", amount: 1200 },
  { id: "SUB-103", customer: "Delta LLC", plan: "Care Plan 1yr", cycle: "Monthly", nextBill: "-", status: "Paused", amount: 299 },
  { id: "SUB-104", customer: "Nova Retail", plan: "NovaCloud Pro", cycle: "Yearly", nextBill: "Oct 20", status: "Active", amount: 3500 },
  { id: "SUB-105", customer: "Apex Systems", plan: "Enterprise Care", cycle: "Monthly", nextBill: "Sep 30", status: "Active", amount: 899 },
  { id: "SUB-106", customer: "Zenith Global", plan: "Basic SLA", cycle: "Monthly", nextBill: "-", status: "Cancelled", amount: 150 },
  { id: "SUB-107", customer: "CyberDyne Inc", plan: "Custom Support", cycle: "Yearly", nextBill: "Nov 15", status: "Active", amount: 4800 },
  { id: "SUB-108", customer: "Omni Consumer Products", plan: "Cloud Infrastructure", cycle: "Monthly", nextBill: "Oct 01", status: "Active", amount: 1500 },
  { id: "SUB-109", customer: "Stark Logistics", plan: "Premium Support SLA", cycle: "Quarterly", nextBill: "Dec 01", status: "Active", amount: 2200 },
  { id: "SUB-110", customer: "Wayne Tech", plan: "Care Plan 2yr", cycle: "Yearly", nextBill: "Aug 15", status: "Active", amount: 5000 },
  { id: "SUB-111", customer: "Hooli Cloud", plan: "Support SLA", cycle: "Monthly", nextBill: "Oct 12", status: "Active", amount: 650 },
  { id: "SUB-112", customer: "Pied Piper", plan: "Enterprise Care", cycle: "Monthly", nextBill: "Sep 28", status: "Active", amount: 950 },
  { id: "SUB-113", customer: "Initech Solutions", plan: "Care Plan 1yr", cycle: "Monthly", nextBill: "-", status: "Paused", amount: 350 },
  { id: "SUB-114", customer: "Massive Dynamic", plan: "NovaCloud Pro", cycle: "Yearly", nextBill: "Jan 10", status: "Active", amount: 4200 },
  { id: "SUB-115", customer: "Umbrella Corp", plan: "Support SLA", cycle: "Monthly", nextBill: "Sep 19", status: "Active", amount: 750 },
  { id: "SUB-116", customer: "Globex Corp", plan: "Care Plan 2yr", cycle: "Quarterly", nextBill: "Nov 05", status: "Active", amount: 1800 },
  { id: "SUB-117", customer: "Soylent Corp", plan: "Basic SLA", cycle: "Monthly", nextBill: "-", status: "Cancelled", amount: 120 },
  { id: "SUB-118", customer: "InGen Labs", plan: "Support SLA", cycle: "Monthly", nextBill: "Oct 08", status: "Active", amount: 800 },
  { id: "SUB-119", customer: "Tyrell Corp", plan: "Enterprise Care", cycle: "Yearly", nextBill: "Dec 20", status: "Active", amount: 6000 },
  { id: "SUB-120", customer: "Oscorp Industries", plan: "Care Plan 2yr", cycle: "Monthly", nextBill: "Sep 22", status: "Active", amount: 550 },
  { id: "SUB-121", customer: "Virtucon Systems", plan: "Support SLA", cycle: "Monthly", nextBill: "Oct 04", status: "Active", amount: 450 },
  { id: "SUB-122", customer: "Cybertron Tech", plan: "Basic SLA", cycle: "Monthly", nextBill: "-", status: "Cancelled", amount: 180 },
  { id: "SUB-123", customer: "Wonka Industries", plan: "Care Plan 1yr", cycle: "Quarterly", nextBill: "Nov 18", status: "Active", amount: 1100 },
];

function Subscriptions({ subscriptionsList, onNavigate, onSelectSubscription }) {
  const [filter, setFilter] = useState("all");

  const subscriptions = subscriptionsList || defaultSubscriptions;

  const activeCount = subscriptions.filter((s) => s.status === "Active").length;
  const pausedCount = subscriptions.filter((s) => s.status === "Paused").length;
  const cancelledCount = subscriptions.filter((s) => s.status === "Cancelled").length;

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filter === "all") return true;
    return sub.status.toLowerCase() === filter.toLowerCase();
  });

  const handleRowClick = (sub) => {
    if (onSelectSubscription) {
      onSelectSubscription(sub);
    }
    if (onNavigate) {
      onNavigate("billing-detail", sub);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "quotations", label: "Quotations" },
    { id: "approvals", label: "Approvals" },
    { id: "fulfillment", label: "Fulfillment" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "invoices", label: "Invoices" },
    { id: "deal-health", label: "Deal Health" },
    { id: "reports", label: "Reports" },
    { id: "customer-portal", label: "Customer Portal" },
  ];

  return (
    <main className="content">
        <h1>Subscriptions (List)</h1>

        <p className="subtitle">
          Every recurring plan across every customer, regardless of which order it came from
        </p>

        {/* Status Counters */}
        <div className="status-container">
          <div className="status approved">
            <span>{activeCount} Active</span>
          </div>

          <div className="status pending">
            <span>{pausedCount} Paused</span>
          </div>

          <div className="status returned">
            <span>{cancelledCount} Cancelled</span>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Cycle</th>
                <th>Next Bill</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} onClick={() => handleRowClick(sub)}>
                  <td>{sub.customer}</td>
                  <td>{sub.plan}</td>
                  <td>{sub.cycle}</td>
                  <td>{sub.nextBill}</td>
                  <td>{sub.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Information Box */}
        <div className="info-box">
          Click a subscription row to open its billing detail and proration history.
        </div>

        {/* Action Button */}
        <div style={{ marginTop: "20px" }}>
          <button
            style={{
              height: "40px",
              padding: "0 16px",
              borderRadius: "10px",
              border: "1px solid #777",
              background: "#ffffff",
              fontSize: "12px",
              cursor: "pointer",
              color: "#222",
            }}
            onClick={() => alert("New Plan creation dialog (Admin restricted)")}
          >
            + New Plan (Admin)
          </button>
        </div>

        {/* Filter Section */}
        <div className="filter-section" style={{ marginTop: "18px" }}>
          <label htmlFor="filter">Filter:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="paused">Paused Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
        </div>
      </main>
  );
}

export default Subscriptions;
