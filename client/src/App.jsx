import { useState } from "react";
import Approvals from "./pages/approval5";
import ApprovalDetail from "./pages/ApprovalDetail";
import Subscriptions from "./pages/Subscriptions";
import Invoices from "./pages/Invoices";
import CustomerPortal from "./pages/CustomerPortal";
import FulfillmentList from "./pages/FulfillmentList";
import Dashboard from "./pages/Dashboard";
import QuotationsPage from "./pages/QuotationsPage";
import DealHealthPage from "./pages/DealHealthPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import Products from "./pages/Products";
import AuthPage from "./pages/AuthPage";
import FulfillmentDetail from "./pages/FulfillmentDetail";
import Navbar from "./components/Navbar";
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState("approvals");
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [selectedFulfillment, setSelectedFulfillment] = useState(null);

  const handleNavigate = (tab, data) => {
    setCurrentTab(tab);
    if (tab === "billing-detail" && data) {
      setSelectedSubscription(data);
    }
    if (tab === "approval-detail" && data) {
      setSelectedApproval(data);
    }
    if (tab === "fulfillment-detail" && data) {
      setSelectedFulfillment(data);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case "subscriptions":
        return (
          <Subscriptions
            onNavigate={handleNavigate}
            onSelectSubscription={(sub) => setSelectedSubscription(sub)}
          />
        );
      case "approvals":
        return <Approvals onNavigate={handleNavigate} />;
      case "approval-detail":
        return <ApprovalDetail onNavigate={handleNavigate} data={selectedApproval} />;
      case "fulfillment-list":
        return <FulfillmentList onNavigate={handleNavigate} />;
      case "fulfillment-detail":
        return <FulfillmentDetail onNavigate={handleNavigate} data={selectedFulfillment} />;
      case "invoices":
        return <Invoices onNavigate={handleNavigate} />;
      case "customer-portal":
        return <CustomerPortal onNavigate={handleNavigate} />;
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "quotations":
        return <QuotationsPage onNavigate={handleNavigate} />;
      case "deal-health":
        return <DealHealthPage onNavigate={handleNavigate} />;
      case "reports":
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      case "product":
        return <Products onNavigate={handleNavigate} />;
      case "auth":
        return <AuthPage onNavigate={handleNavigate} />;
      case "billing-detail":
        return (
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
        );
      default:
        return (
          <main className="content">
            <h1>Coming Soon</h1>
            <p className="subtitle">This page is under construction.</p>
          </main>
        );
    }
  };

  return (
    <div className="app">
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
      {renderContent()}
    </div>
  );
}

export default App;
