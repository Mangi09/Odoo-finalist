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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>
            Billing Detail: {customerName} - {planName}
          </h1>

          <button
            style={{
              height: "34px",
              padding: "0 14px",
              borderRadius: "8px",
              border: "1px solid #1976bd",
              background: "#1976bd",
              color: "#ffffff",
              fontSize: "12px",
              cursor: "pointer",
            }}
            onClick={() => onNavigate && onNavigate("subscriptions")}
          >
            &larr; Back to Subscriptions
          </button>
        </div>

        {notification && (
          <div className="info-box" style={{ marginTop: "12px", marginBottom: "12px" }}>
            {notification}
          </div>
        )}

        <div style={{ marginTop: "6px", marginBottom: "18px", fontSize: "13px", color: "#555" }}>
          Status: <strong style={{ color: subStatus === "Cancelled" ? "#e82d32" : "#299b45" }}>{subStatus}</strong>
        </div>

        {/* Section 1: One-Time Lines */}
        <section style={{ marginTop: "15px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "10px", color: "#222" }}>
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

        {/* Section 2: Recurring Lines */}
        <section style={{ marginTop: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "10px", color: "#222" }}>
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

        {/* Section 3: Actions */}
        <div style={{ display: "flex", gap: "12px", marginTop: "25px" }}>
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
            onClick={() => setShowModifyModal(true)}
          >
            Modify Subscription
          </button>

          <button
            style={{
              height: "40px",
              padding: "0 16px",
              borderRadius: "10px",
              border: "1px solid #222",
              background: "#e82d32",
              color: "#ffffff",
              fontSize: "12px",
              cursor: "pointer",
            }}
            onClick={handleCancel}
            disabled={subStatus === "Cancelled"}
          >
            {subStatus === "Cancelled" ? "Cancelled" : "Cancel Subscription"}
          </button>
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
              <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Modify Subscription Cycle</h3>
              <form onSubmit={handleModifySubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", color: "#555" }}>
                    Billing Cycle:
                  </label>
                  <select
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                    style={{
                      width: "100%",
                      height: "36px",
                      borderRadius: "6px",
                      border: "1px solid #777",
                      padding: "0 8px",
                      fontSize: "12px",
                    }}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowModifyModal(false)}
                    style={{
                      height: "34px",
                      padding: "0 12px",
                      borderRadius: "6px",
                      border: "1px solid #777",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      height: "34px",
                      padding: "0 14px",
                      borderRadius: "6px",
                      border: "1px solid #1976bd",
                      background: "#1976bd",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
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
