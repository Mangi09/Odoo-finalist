import React from "react";
import {
  FileText,
  CreditCard,
  Package,
  Layers,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Inbox,
  AlertCircle
} from "lucide-react";

export default function RightPanel({
  currentTab,
  selectedSubscription,
  selectedInvoice,
  selectedProduct,
  selectedApproval,
  selectedFulfillment,
  onNavigate
}) {
  // Render based on active module and selection
  const renderPanelContent = () => {
    // 1. Subscriptions Context
    if (currentTab === "subscriptions" || currentTab === "billing-detail") {
      if (selectedSubscription) {
        return (
          <div className="panel-card active-detail">
            <div className="panel-badge-row">
              <span className="panel-badge blue">Subscription Details</span>
              <span className={`panel-status-pill ${selectedSubscription.status.toLowerCase()}`}>
                {selectedSubscription.status}
              </span>
            </div>

            <h3 className="panel-title">{selectedSubscription.customer}</h3>
            <p className="panel-subtitle-text">{selectedSubscription.plan}</p>

            <div className="panel-meta-list">
              <div className="panel-meta-item">
                <span className="meta-label">Subscription ID</span>
                <span className="meta-value">{selectedSubscription.id}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Billing Cycle</span>
                <span className="meta-value">{selectedSubscription.cycle}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Recurring Amount</span>
                <span className="meta-value font-bold">${selectedSubscription.amount} / {selectedSubscription.cycle.toLowerCase()}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Next Bill Date</span>
                <span className="meta-value">{selectedSubscription.nextBill}</span>
              </div>
            </div>

            <div className="panel-actions">
              <button
                type="button"
                className="panel-btn-primary"
                onClick={() => onNavigate("billing-detail", selectedSubscription)}
              >
                <span>View Full Billing Detail</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="panel-card empty-state">
          <div className="panel-illustration-box">
            <div className="empty-state-icon-circle">
              <CreditCard size={32} className="empty-icon-svg" />
            </div>
          </div>
          <h4 className="empty-state-title">No Subscription Selected</h4>
          <p className="empty-state-desc">
            Select any recurring plan from the table to inspect contract cycles, payment schedules, and billing history.
          </p>
          <div className="panel-tip-card">
            <Sparkles size={14} className="tip-icon" />
            <span>Clicking any row opens comprehensive billing details for that customer.</span>
          </div>
        </div>
      );
    }

    // 2. Invoices Context
    if (currentTab === "invoices" || currentTab === "invoice-detail") {
      if (selectedInvoice) {
        return (
          <div className="panel-card active-detail">
            <div className="panel-badge-row">
              <span className="panel-badge blue">Invoice Summary</span>
              <span className={`panel-status-pill ${selectedInvoice.status.toLowerCase()}`}>
                {selectedInvoice.status}
              </span>
            </div>

            <h3 className="panel-title">{selectedInvoice.id}</h3>
            <p className="panel-subtitle-text">{selectedInvoice.customer}</p>

            <div className="panel-meta-list">
              <div className="panel-meta-item">
                <span className="meta-label">Amount Due</span>
                <span className="meta-value font-bold">{selectedInvoice.amount}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Due Date</span>
                <span className="meta-value">{selectedInvoice.dueDate}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Invoice Type</span>
                <span className="meta-value">{selectedInvoice.type}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Payment Status</span>
                <span className="meta-value">{selectedInvoice.status}</span>
              </div>
            </div>

            <div className="panel-tip-card" style={{ marginTop: "16px" }}>
              <Clock size={14} className="tip-icon" />
              <span>Terms: Net 30 days standard reconciliation.</span>
            </div>
          </div>
        );
      }

      return (
        <div className="panel-card empty-state">
          <div className="panel-illustration-box">
            <div className="empty-state-icon-circle">
              <FileText size={32} className="empty-icon-svg" />
            </div>
          </div>
          <h4 className="empty-state-title">No Invoice Selected</h4>
          <p className="empty-state-desc">
            Select an invoice from the main list to view payment reconciliation, customer terms, and outstanding balances.
          </p>
          <div className="panel-tip-card">
            <Sparkles size={14} className="tip-icon" />
            <span>Click any invoice row to see breakdown details.</span>
          </div>
        </div>
      );
    }

    // 3. Product Context
    if (currentTab === "product" || currentTab === "product-detail") {
      if (selectedProduct) {
        return (
          <div className="panel-card active-detail">
            <div className="panel-badge-row">
              <span className="panel-badge blue">Product Specs</span>
              <span className="panel-status-pill approved">{selectedProduct.status || "Active"}</span>
            </div>

            <h3 className="panel-title">{selectedProduct.name}</h3>
            <p className="panel-subtitle-text">{selectedProduct.id} • {selectedProduct.category}</p>

            <div className="panel-meta-list">
              <div className="panel-meta-item">
                <span className="meta-label">Unit Price</span>
                <span className="meta-value font-bold">{selectedProduct.price}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Billing Type</span>
                <span className="meta-value">{selectedProduct.billingType || "ONE_TIME"}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Variants</span>
                <span className="meta-value">{selectedProduct.variants || "Standard"}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Tax Rate</span>
                <span className="meta-value">{selectedProduct.tax}</span>
              </div>
            </div>

            <div className="panel-actions">
              <button
                type="button"
                className="panel-btn-primary"
                onClick={() => onNavigate("product-detail", selectedProduct)}
              >
                <span>Edit Product Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="panel-card empty-state">
          <div className="panel-illustration-box">
            <div className="empty-state-icon-circle">
              <Package size={32} className="empty-icon-svg" />
            </div>
          </div>
          <h4 className="empty-state-title">Product Catalog Info</h4>
          <p className="empty-state-desc">
            Select a product from the catalog to review pricing rules, variant matrices, and warehouse availability.
          </p>
          <div className="panel-tip-card">
            <Sparkles size={14} className="tip-icon" />
            <span>Select any item to configure recurring cycles or tax rates.</span>
          </div>
        </div>
      );
    }

    // 4. Approvals Context
    if (currentTab === "approvals" || currentTab === "approval-detail") {
      if (selectedApproval) {
        return (
          <div className="panel-card active-detail">
            <div className="panel-badge-row">
              <span className="panel-badge blue">Approval Inspection</span>
              <span className={`panel-status-pill ${selectedApproval.risk.toLowerCase()}`}>
                Risk: {selectedApproval.risk}
              </span>
            </div>

            <h3 className="panel-title">{selectedApproval.quotation}</h3>
            <p className="panel-subtitle-text">{selectedApproval.customer}</p>

            <div className="panel-meta-list">
              <div className="panel-meta-item">
                <span className="meta-label">Stage</span>
                <span className="meta-value">{selectedApproval.stage}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Assigned Reviewer</span>
                <span className="meta-value font-bold">{selectedApproval.assigned}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Blended Risk</span>
                <span className="meta-value">{selectedApproval.risk}</span>
              </div>
            </div>

            <div className="panel-actions">
              <button
                type="button"
                className="panel-btn-primary"
                onClick={() => onNavigate("approval-detail", selectedApproval)}
              >
                <span>Review Full Audit Trail</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="panel-card empty-state">
          <div className="panel-illustration-box">
            <div className="empty-state-icon-circle">
              <ShieldAlert size={32} className="empty-icon-svg" />
            </div>
          </div>
          <h4 className="empty-state-title">Approvals Queue</h4>
          <p className="empty-state-desc">
            Select any quotation from the list to analyze discount deviations, profit margin impact, and workflow history.
          </p>
          <div className="panel-tip-card">
            <Sparkles size={14} className="tip-icon" />
            <span>Deals with high blended risk require dual manager approval.</span>
          </div>
        </div>
      );
    }

    // 5. Fulfillment Context
    if (currentTab === "fulfillment" || currentTab === "fulfillment-list" || currentTab === "fulfillment-detail") {
      if (selectedFulfillment) {
        return (
          <div className="panel-card active-detail">
            <div className="panel-badge-row">
              <span className="panel-badge blue">Order Allocation</span>
              <span className="panel-status-pill pending">{selectedFulfillment.status}</span>
            </div>

            <h3 className="panel-title">{selectedFulfillment.order}</h3>
            <p className="panel-subtitle-text">{selectedFulfillment.customer}</p>

            <div className="panel-meta-list">
              <div className="panel-meta-item">
                <span className="meta-label">Fulfillment Status</span>
                <span className="meta-value">{selectedFulfillment.status}</span>
              </div>
              <div className="panel-meta-item">
                <span className="meta-label">Target Warehouses</span>
                <span className="meta-value font-bold">{selectedFulfillment.warehouses}</span>
              </div>
            </div>

            <div className="panel-actions">
              <button
                type="button"
                className="panel-btn-primary"
                onClick={() => onNavigate("fulfillment-detail", selectedFulfillment)}
              >
                <span>Inspect Split Plan</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="panel-card empty-state">
          <div className="panel-illustration-box">
            <div className="empty-state-icon-circle">
              <Layers size={32} className="empty-icon-svg" />
            </div>
          </div>
          <h4 className="empty-state-title">Warehouse Allocation</h4>
          <p className="empty-state-desc">
            Select an order awaiting fulfillment to inspect warehouse split logic, stock reservation, and backorders.
          </p>
        </div>
      );
    }

    // 6. Dashboard / Default Pulse
    return (
      <div className="panel-card default-overview">
        <div className="panel-badge-row">
          <span className="panel-badge blue">Operations Pulse</span>
          <span className="panel-live-indicator">LIVE</span>
        </div>

        <h3 className="panel-title">DealFlow Activity</h3>
        <p className="panel-subtitle-text">Real-time status across active pipelines</p>

        <div className="panel-pulse-list">
          <div className="pulse-item attention">
            <div className="pulse-item-icon">
              <AlertCircle size={16} />
            </div>
            <div className="pulse-item-body">
              <span className="pulse-item-title">4 Pending Approvals</span>
              <span className="pulse-item-sub">Discount exceptions waiting review</span>
            </div>
          </div>

          <div className="pulse-item normal">
            <div className="pulse-item-icon">
              <TrendingUp size={16} />
            </div>
            <div className="pulse-item-body">
              <span className="pulse-item-title">12 Open Quotations</span>
              <span className="pulse-item-sub">Active deals across sales reps</span>
            </div>
          </div>

          <div className="pulse-item warning">
            <div className="pulse-item-icon">
              <ShieldAlert size={16} />
            </div>
            <div className="pulse-item-body">
              <span className="pulse-item-title">3 At-Risk Deals</span>
              <span className="pulse-item-sub">Stalled negotiations flagged by AI</span>
            </div>
          </div>
        </div>

        <div className="panel-tip-card" style={{ marginTop: "18px" }}>
          <Sparkles size={14} className="tip-icon" />
          <span>Select any module from the left sidebar to drill into records.</span>
        </div>
      </div>
    );
  };

  return (
    <aside className="app-context-panel">
      {/* Top Contextual Header Widget (Inspired by Figma Banner Card) */}
      <div className="context-panel-header-card">
        <div className="header-card-graphic">
          <div className="graphic-backdrop">
            <Package size={28} className="graphic-main-icon" />
          </div>
        </div>
        <div className="header-card-text">
          <span className="header-card-tag">CONTEXT INSPECTOR</span>
          <h4 className="header-card-title">Live Detail Panel</h4>
        </div>
      </div>

      {/* Dynamic Module Content */}
      <div className="context-panel-body">
        {renderPanelContent()}
      </div>
    </aside>
  );
}
