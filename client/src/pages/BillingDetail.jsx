import React, { useState } from "react";
import "../App.css";

const customerLinesMap = {
  "Acme Corp": {
    oneTime: [
      { product: "Laptop Pro 14", qty: 2, amount: "$2,280" },
      { product: "Onsite Setup", qty: 1, amount: "$450" },
    ],
    recurring: [
      { plan: "Care Plan 2yr", cycle: "Monthly", nextBill: "Sep 15", amount: "$46" },
      { plan: "Support SLA", cycle: "Quarterly", nextBill: "Nov 1", amount: "$300" },
    ],
  },
  "Beta Industries": {
    oneTime: [
      { product: "Workstation Desktop Ultra", qty: 5, amount: "$7,500" },
      { product: "Network Configuration", qty: 1, amount: "$1,200" },
    ],
    recurring: [
      { plan: "Support SLA", cycle: "Quarterly", nextBill: "Nov 1", amount: "$1,200" },
      { plan: "Backup Cloud Storage", cycle: "Monthly", nextBill: "Sep 30", amount: "$250" },
    ],
  },
  "Delta LLC": {
    oneTime: [
      { product: "Server Rack 42U", qty: 1, amount: "$3,400" },
      { product: "Hardware Installation", qty: 1, amount: "$800" },
    ],
    recurring: [
      { plan: "Care Plan 1yr", cycle: "Monthly", nextBill: "-", amount: "$299" },
    ],
  },
};

function BillingDetail({ subscription, onNavigate, onUpdateSubscriptionStatus }) {
  const [subStatus, setSubStatus] = useState(subscription?.status || "Active");
  const [notification, setNotification] = useState("");
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(subscription?.cycle || "Monthly");

  const customerName = subscription?.customer || "Acme Corp";
  const planName = subscription?.plan || "Care Plan 2yr";

  const customerData = customerLinesMap[customerName] || {
    oneTime: [
      { product: "Enterprise Hardware Bundle", qty: 1, amount: "$2,500" },
      { product: "Initial Deployment Service", qty: 1, amount: "$500" },
    ],
    recurring: [
      {
        plan: planName,
        cycle: selectedCycle,
        nextBill: subscription?.nextBill || "Sep 15",
        amount: `$${subscription?.amount || 499}`,
      },
    ],
  };

  const handleCancel = () => {
    if (window.confirm(`Are you sure you want to cancel subscription for ${customerName}?`)) {
      setSubStatus("Cancelled");
      setNotification(`Subscription for ${customerName} has been cancelled.`);
      if (onUpdateSubscriptionStatus && subscription?.id) {
        onUpdateSubscriptionStatus(subscription.id, "Cancelled");
      }
    }
  };

  const handleModifySubmit = (e) => {
    e.preventDefault();
    setShowModifyModal(false);
    setNotification(`Subscription updated for ${customerName} (Cycle: ${selectedCycle}).`);
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
  ];

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">DealFlow360</div>

        <div className="nav-links">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={item.id === "subscriptions" ? "active" : ""}
              onClick={() => onNavigate && onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="content">
        <div className="page-card">
          <div className="page-header">
            <h1>
              Billing Detail: {customerName} - {planName}
            </h1>

            <button
              className="btn-secondary"
              onClick={() => onNavigate && onNavigate("subscriptions")}
            >
              &larr; Back to Subscriptions
            </button>
          </div>

          {notification && (
            <div className="info-box">
              {notification}
            </div>
          )}

          <div>
            Status: <strong style={{ color: subStatus === "Cancelled" ? "#e82d32" : "#299b45" }}>{subStatus}</strong>
          </div>
        </div>

        {/* Section 1: One-Time Lines */}
        <div className="page-card">
          <section>
            <h2>
              One-Time Lines (from originating order)
            </h2>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {customerData.oneTime.map((line, idx) => (
                    <tr key={idx}>
                      <td>{line.product}</td>
                      <td>{line.qty}</td>
                      <td>{line.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Section 2: Recurring Lines */}
        <div className="page-card">
          <section>
            <h2>
              Recurring Lines
            </h2>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Cycle</th>
                    <th>Next Bill Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {customerData.recurring.map((line, idx) => (
                    <tr key={idx}>
                      <td>{line.plan}</td>
                      <td>{line.cycle}</td>
                      <td>{subStatus === "Cancelled" ? "-" : line.nextBill}</td>
                      <td>{line.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Section 3: Actions */}
        <div className="page-card">
          <div className="page-header-left" style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn-outline"
              onClick={() => setShowModifyModal(true)}
            >
              Modify Subscription
            </button>

            <button
              className="btn-danger"
              onClick={handleCancel}
              disabled={subStatus === "Cancelled"}
            >
              {subStatus === "Cancelled" ? "Cancelled" : "Cancel Subscription"}
            </button>
          </div>
        </div>

        {/* Modify Modal */}
        {showModifyModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px 24px",
                borderRadius: "12px",
                width: "360px",
                border: "2px solid #c5c5c5",
              }}
            >
              <h3>Modify Subscription Cycle</h3>
              <form onSubmit={handleModifySubmit}>
                <div>
                  <label>
                    Billing Cycle:
                  </label>
                  <select
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setShowModifyModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BillingDetail;
