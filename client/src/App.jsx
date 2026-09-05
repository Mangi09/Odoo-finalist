import { useState } from "react";
import Approvals from "./pages/approval5";
import Subscriptions from "./pages/Subscriptions";
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState("subscriptions");
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const handleNavigate = (tab, data) => {
    setCurrentTab(tab);
    if (data) {
      setSelectedSubscription(data);
    }
  };

  if (currentTab === "subscriptions") {
    return (
      <Subscriptions
        onNavigate={handleNavigate}
        onSelectSubscription={(sub) => setSelectedSubscription(sub)}
      />
    );
  }

  if (currentTab === "approvals") {
    return <Approvals onNavigate={handleNavigate} />;
  }

  if (currentTab === "billing-detail") {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="logo">DealFlow360</div>
          <div className="nav-links">
            <button onClick={() => setCurrentTab("dashboard")}>Dashboard</button>
            <button onClick={() => setCurrentTab("quotations")}>Quotations</button>
            <button onClick={() => setCurrentTab("approvals")}>Approvals</button>
            <button onClick={() => setCurrentTab("fulfillment")}>Fulfillment</button>
            <button className="active" onClick={() => setCurrentTab("subscriptions")}>Subscriptions</button>
            <button onClick={() => setCurrentTab("invoices")}>Invoices</button>
            <button onClick={() => setCurrentTab("deal-health")}>Deal Health</button>
            <button onClick={() => setCurrentTab("reports")}>Reports</button>
          </div>
        </nav>
        <main className="content">
          <h1>Billing Detail (Screen 10 Placeholder)</h1>
          <p className="subtitle">
            Screen 10 is ready to be implemented next.
          </p>
          {selectedSubscription ? (
            <div className="info-box" style={{ height: "auto", padding: "12px" }}>
              <strong>Selected Subscription:</strong> {selectedSubscription.customer} - {selectedSubscription.plan} ({selectedSubscription.cycle}) - Status: {selectedSubscription.status}
            </div>
          ) : (
            <div className="info-box">No subscription selected.</div>
          )}
          <button
            style={{
              marginTop: "20px",
              height: "40px",
              padding: "0 14px",
              borderRadius: "10px",
              border: "1px solid #777",
              background: "#fff",
              cursor: "pointer",
            }}
            onClick={() => setCurrentTab("subscriptions")}
          >
            &larr; Back to Subscriptions List
          </button>
        </main>
      </div>
    );
  }

  return (
    <Subscriptions
      onNavigate={handleNavigate}
      onSelectSubscription={(sub) => setSelectedSubscription(sub)}
    />
  );
}

export default App;

