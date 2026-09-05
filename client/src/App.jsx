import { useState } from "react";
import Approvals from "./pages/approval5";
import ApprovalDetail from "./pages/ApprovalDetail";
import Subscriptions from "./pages/Subscriptions";
import BillingDetail from "./pages/BillingDetail";
import Invoices from "./pages/Invoices";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import SalesOrders from "./pages/SalesOrders";
import CustomerPortal from "./pages/CustomerPortal";
import FulfillmentList from "./pages/FulfillmentList";
import FulfillmentDetail from "./pages/FulfillmentDetail";
import Dashboard from "./pages/Dashboard";
import QuotationsPage from "./pages/QuotationsPage";
import DealHealthPage from "./pages/DealHealthPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import DiscountRules from "./pages/DiscountRules";
import AuthPage from "./pages/AuthPage";
import CreateAccountPage from "./pages/CreateAccountPage";

import AppLayout from "./components/AppLayout";
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
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("dealflow-authenticated") === "true");
  const [currentTab, setCurrentTab] = useState(() => localStorage.getItem("dealflow-authenticated") === "true" ? "dashboard" : "auth");
  const [selectedSubscription, setSelectedSubscription] = useState(initialSubscriptions[0]);
  const [selectedApproval, setSelectedApproval] = useState({
    quotation: "Q-1042",
    customer: "Acme Corp",
    risk: "HIGH",
    stage: "Sales Manager",
    assigned: "M. Shah"
  });
  const [selectedFulfillment, setSelectedFulfillment] = useState({
    order: "Q-1042",
    customer: "Acme Corp",
    status: "Split Pending",
    warehouses: "Main + East Depot"
  });
  const [selectedInvoice, setSelectedInvoice] = useState({
    id: "INV-1042",
    customer: "Acme Corp",
    amount: "$2,730",
    status: "Unpaid",
    dueDate: "Sep 10",
    type: "One-Time"
  });
  const [selectedQuotation, setSelectedQuotation] = useState({
    id: "Q-1042",
    customer: "Acme Corp",
    total: "$2,730",
    status: "Approval",
  });
  const [selectedProduct, setSelectedProduct] = useState({
    id: "PROD-001",
    name: "Laptop Pro 14",
    category: "Hardware",
    variants: "3 (size)",
    price: "$1,200",
    unit: "Each",
    tax: "15%",
    status: "Active",
    billingType: "ONE_TIME"
  });

  const handleNavigate = (tab, data) => {
    if (tab === "auth") {
      localStorage.removeItem("dealflow-authenticated");
      setIsAuthenticated(false);
      setCurrentTab("auth");
      return;
    }

    if (tab === "dashboard" && (currentTab === "auth" || currentTab === "create-account" || !isAuthenticated)) {
      localStorage.setItem("dealflow-authenticated", "true");
      setIsAuthenticated(true);
    }

    setCurrentTab(tab);
    if ((tab === "billing-detail" || tab === "subscriptions") && data) {
      setSelectedSubscription(data);
    }
    if ((tab === "approval-detail" || tab === "approvals") && data) {
      setSelectedApproval(data);
    }
    if ((tab === "fulfillment-detail" || tab === "fulfillment" || tab === "fulfillment-list") && data) {
      setSelectedFulfillment(data);
    }
    if ((tab === "invoices" || tab === "invoice-detail") && data) {
      setSelectedInvoice(data);
    }
    if ((tab === "quotations" || tab === "quotation-detail" || tab === "customer-portal" || tab === "orders") && data) {
      setSelectedQuotation(data);
    }
    if ((tab === "product" || tab === "product-detail") && data) {
      setSelectedProduct(data);
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
      case "fulfillment":
      case "fulfillment-list":
        return <FulfillmentList onNavigate={handleNavigate} />;
      case "fulfillment-detail":
        return <FulfillmentDetail onNavigate={handleNavigate} data={selectedFulfillment} />;
      case "invoices":
        return <Invoices onNavigate={handleNavigate} />;
      case "invoice-detail":
        return <InvoiceDetailPage onNavigate={handleNavigate} invoice={selectedInvoice} />;
      case "orders":
        return <SalesOrders onNavigate={handleNavigate} quote={selectedQuotation} />;
      case "customer-portal":
        return <CustomerPortal onNavigate={handleNavigate} quote={selectedQuotation} />;
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "quotations":
        return <QuotationsPage onNavigate={handleNavigate} />;
      case "quotation-detail":
        return <QuotationDetailPage onNavigate={handleNavigate} quote={selectedQuotation} />;
      case "deal-health":
        return <DealHealthPage onNavigate={handleNavigate} />;
      case "reports":
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      case "product":
        return (
          <Products
            onNavigate={handleNavigate}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
          />
        );
      case "product-detail":
        return (
          <ProductDetail
            product={selectedProduct}
            onNavigate={handleNavigate}
          />
        );
      case "discount-rules":
        return <DiscountRules onNavigate={handleNavigate} />;
      case "auth":
        return <AuthPage onNavigate={handleNavigate} />;
      case "create-account":
        return <CreateAccountPage onNavigate={handleNavigate} />;
      case "billing-detail":
        return (
          <BillingDetail
            subscription={selectedSubscription}
            onNavigate={handleNavigate}
          />
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

  if (currentTab === "create-account") {
    return <CreateAccountPage onNavigate={handleNavigate} />;
  }

  if (!isAuthenticated || currentTab === "auth") {
    return <AuthPage onNavigate={handleNavigate} />;
  }

  return (
    <AppLayout
      currentTab={currentTab}
      onNavigate={handleNavigate}
      selectedSubscription={selectedSubscription}
      selectedInvoice={selectedInvoice}
      selectedProduct={selectedProduct}
      selectedApproval={selectedApproval}
      selectedFulfillment={selectedFulfillment}
    >
      {renderContent()}
    </AppLayout>
  );
}

export default App;
