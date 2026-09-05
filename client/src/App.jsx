import { useState } from "react";
import Approvals from "./pages/approval5";
import Subscriptions from "./pages/Subscriptions";
import BillingDetail from "./pages/BillingDetail";
import CustomerPortal from "./pages/CustomerPortal";
import Invoices from "./pages/Invoices";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import DiscountRules from "./pages/DiscountRules";
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
  const [currentTab, setCurrentTab] = useState("subscriptions");
  const [subscriptionsList, setSubscriptionsList] = useState(initialSubscriptions);
  const [selectedSubscription, setSelectedSubscription] = useState(initialSubscriptions[0]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleNavigate = (tab, data) => {
    setCurrentTab(tab);
    if (tab === "product-detail" || tab === "products") {
      if (data) setSelectedProduct(data);
    } else if (data) {
      setSelectedSubscription(data);
    }
  };

  const handleUpdateSubscriptionStatus = (subId, newStatus) => {
    setSubscriptionsList((prev) =>
      prev.map((sub) =>
        sub.id === subId ? { ...sub, status: newStatus, nextBill: newStatus === "Cancelled" ? "-" : sub.nextBill } : sub
      )
    );
    if (selectedSubscription && selectedSubscription.id === subId) {
      setSelectedSubscription((prev) => ({
        ...prev,
        status: newStatus,
        nextBill: newStatus === "Cancelled" ? "-" : prev.nextBill,
      }));
    }
  };

  if (currentTab === "discount-rules") {
    return <DiscountRules onNavigate={handleNavigate} />;
  }

  if (currentTab === "product-detail") {
    return <ProductDetail product={selectedProduct} onNavigate={handleNavigate} />;
  }

  if (currentTab === "products" || currentTab === "product") {
    return (
      <Products
        onNavigate={handleNavigate}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
      />
    );
  }

  if (currentTab === "customer-portal") {
    return <CustomerPortal onNavigate={handleNavigate} />;
  }

  if (currentTab === "invoices") {
    return <Invoices onNavigate={handleNavigate} />;
  }

  if (currentTab === "subscriptions") {
    return (
      <Subscriptions
        subscriptionsList={subscriptionsList}
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
      <BillingDetail
        subscription={selectedSubscription}
        onNavigate={handleNavigate}
        onUpdateSubscriptionStatus={handleUpdateSubscriptionStatus}
      />
    );
  }

  return (
    <Subscriptions
      subscriptionsList={subscriptionsList}
      onNavigate={handleNavigate}
      onSelectSubscription={(sub) => setSelectedSubscription(sub)}
    />
  );
}

export default App;







