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
import QuotationDetailPage from "./pages/QuotationDetailPage";

import AppLayout from "./components/AppLayout";
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("dealflow-authenticated") === "true");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("dealflow-user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [currentTab, setCurrentTab] = useState(() => {
    if (localStorage.getItem("dealflow-authenticated") === "true") {
      try {
        const stored = localStorage.getItem("dealflow-user");
        const user = stored ? JSON.parse(stored) : null;
        if (user && user.role === 'customer') return "customer-portal";
        if (user && user.role === 'finance_ops') return "approvals";
      } catch {}
      return "dashboard";
    }
    return "auth";
  });
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [selectedFulfillment, setSelectedFulfillment] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleNavigate = (tab, data) => {
    if (tab === "auth") {
      localStorage.removeItem("dealflow-authenticated");
      localStorage.removeItem("dealflow-user");
      localStorage.removeItem("dealflow-token");
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentTab("auth");
      return;
    }

    if (tab === "dashboard" && (currentTab === "auth" || currentTab === "create-account" || !isAuthenticated)) {
      localStorage.setItem("dealflow-authenticated", "true");
      setIsAuthenticated(true);
      let user = null;
      try {
        const stored = localStorage.getItem("dealflow-user");
        user = stored ? JSON.parse(stored) : null;
        setCurrentUser(user);
      } catch {}

      if (user && user.role === 'customer') {
        setCurrentTab("customer-portal");
        return;
      }
      if (user && user.role === 'finance_ops') {
        setCurrentTab("approvals");
        return;
      }
    }

    // Intercept manual dashboard clicks if unauthorized
    if (tab === "dashboard" && currentUser) {
      if (currentUser.role === 'customer') {
        setCurrentTab("customer-portal");
        return;
      }
      if (currentUser.role === 'finance_ops') {
        setCurrentTab("approvals");
        return;
      }
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

  const hasAccess = (tab) => {
    if (!currentUser) return false;
    const role = currentUser.role;
    if (role === 'admin') return true;

    switch (tab) {
      case 'dashboard':
      case 'quotations':
      case 'quotation-detail':
        return ['salesperson', 'sales_manager'].includes(role);
      case 'orders':
      case 'subscriptions':
      case 'billing-detail':
      case 'invoices':
      case 'invoice-detail':
        return ['salesperson', 'sales_manager', 'finance_ops', 'customer', 'admin'].includes(role);
      case 'deal-health':
        return ['sales_manager', 'finance_ops', 'admin'].includes(role);
      case 'product':
      case 'product-detail':
        return ['salesperson', 'sales_manager', 'finance_ops', 'admin'].includes(role);
      case 'approvals':
      case 'approval-detail':
      case 'fulfillment':
      case 'fulfillment-list':
      case 'fulfillment-detail':
        return ['sales_manager', 'finance_ops'].includes(role);
      case 'reports':
        return ['sales_manager'].includes(role);
      case 'discount-rules':
        return false; // admin only
      case 'customer-portal':
        return ['salesperson', 'sales_manager', 'customer', 'admin'].includes(role);
      default:
        return false;
    }
  };

  const renderContent = () => {
    if (isAuthenticated && !['auth', 'create-account'].includes(currentTab) && !hasAccess(currentTab)) {
      return (
        <main className="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
          <h1 style={{ color: '#e53e3e', fontSize: '24px', marginBottom: '8px' }}>Access Denied</h1>
          <p className="subtitle">You do not have permission to view this page.</p>
        </main>
      );
    }

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
        return <InvoiceDetailPage onNavigate={handleNavigate} invoice={selectedInvoice} currentUser={currentUser} />;
      case "orders":
        return <SalesOrders onNavigate={handleNavigate} quote={selectedQuotation} />;
      case "customer-portal":
        return <CustomerPortal onNavigate={handleNavigate} quote={selectedQuotation} currentUser={currentUser} />;
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "quotations":
        return <QuotationsPage onNavigate={handleNavigate} />;
      case "quotation-detail":
        return <QuotationDetailPage onNavigate={handleNavigate} quote={selectedQuotation} currentUser={currentUser} />;
      case "deal-health":
        return <DealHealthPage onNavigate={handleNavigate} />;
      case "reports":
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      case "product":
        return (
          <Products
            onNavigate={handleNavigate}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
            currentUser={currentUser}
          />
        );
      case "product-detail":
        return (
          <ProductDetail
            product={selectedProduct}
            onNavigate={handleNavigate}
            currentUser={currentUser}
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
            currentUser={currentUser}
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
      currentUser={currentUser}
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
