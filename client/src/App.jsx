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

const initialSubscriptions = [
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
