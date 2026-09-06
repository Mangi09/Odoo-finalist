import React, { useEffect, useMemo, useState } from "react";
import "../App.css";
import { api } from "../services/api";

function BillingDetail({ subscription, onNavigate, onUpdateSubscriptionStatus, currentUser }) {
  const [currentSub, setCurrentSub] = useState(subscription || {});
  const [subStatus, setSubStatus] = useState(subscription?.status || "Active");
  const [notification, setNotification] = useState("");
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(subscription?.cycle || "Monthly");
  const canModify = !['salesperson', 'customer'].includes(currentUser?.role);

  useEffect(() => {
    setCurrentSub(subscription || {});
    setSubStatus(subscription?.status || "Active");
    setSelectedCycle(subscription?.cycle || "Monthly");
    if (subscription?._id) {
      api.subscriptions.getById(subscription._id)
        .then(data => {
          setCurrentSub(prev => ({ ...prev, ...data }));
          setSubStatus(data?.status || subscription?.status || "Active");
          setSelectedCycle(data?.cycle || subscription?.cycle || "Monthly");
        })
        .catch(err => setNotification(`Unable to load subscription: ${err.message}`));
    }
  }, [subscription]);

  const customerName = currentSub?.customer || "Customer";
  const planName = currentSub?.plan || "Subscription";
  const amount = Number(currentSub?.amount || 0);
  const customerData = useMemo(() => ({
    oneTime: [],
    recurring: [{
      plan: planName,
      cycle: selectedCycle,
      nextBill: currentSub?.nextBill || "-",
      amount: `₹${amount.toLocaleString('en-IN')}`,
    }],
  }), [planName, selectedCycle, currentSub?.nextBill, amount]);

  const handleCancel = async () => {
    if (!canModify) return;
    if (window.confirm(`Are you sure you want to cancel subscription for ${customerName}?`)) {
      try {
        if (currentSub?._id) await api.subscriptions.updateStatus(currentSub._id, "CANCELLED");
        setSubStatus("Cancelled");
        setNotification(`Subscription for ${customerName} has been cancelled.`);
        if (onUpdateSubscriptionStatus && currentSub?.id) {
          onUpdateSubscriptionStatus(currentSub.id, "Cancelled");
        }
      } catch (err) {
        setNotification(`Unable to cancel subscription: ${err.message}`);
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
        {canModify && (
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
        )}

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
