import React, { useState } from "react";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import { PanelRightClose, PanelRightOpen, Menu, X } from "lucide-react";

export default function AppLayout({
  children,
  currentTab,
  onNavigate,
  selectedSubscription,
  selectedInvoice,
  selectedProduct,
  selectedApproval,
  selectedFulfillment
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const handleNavigateWrapper = (tab, data) => {
    setMobileSidebarOpen(false);
    if (onNavigate) {
      onNavigate(tab, data);
    }
  };

  return (
    <div className="dealflow-app-layout">
      {/* Mobile Topbar (< 1000px) */}
      <header className="mobile-app-header">
        <button
          type="button"
          className="mobile-icon-btn"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="mobile-brand-title">DealFlow360</span>
        <button
          type="button"
          className="mobile-icon-btn"
          aria-label="Toggle context panel"
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
        >
          {rightPanelOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {(mobileSidebarOpen || rightPanelOpen) && (
        <div
          className="mobile-backdrop"
          onClick={() => {
            setMobileSidebarOpen(false);
            setRightPanelOpen(false);
          }}
        />
      )}

      {/* 1. Left Persistent Sidebar */}
      <div className={`layout-sidebar-col ${mobileSidebarOpen ? "mobile-open" : ""}`}>
        <Sidebar
          currentTab={currentTab}
          onNavigate={handleNavigateWrapper}
        />
      </div>

      {/* 2. Center Main Content Viewport */}
      <main className="layout-center-col">
        <div className="center-card-container">
          {children}
        </div>
      </main>

      {/* 3. Right Contextual Panel */}
      <div className={`layout-right-col ${rightPanelOpen ? "mobile-open" : ""}`}>
        <RightPanel
          currentTab={currentTab}
          selectedSubscription={selectedSubscription}
          selectedInvoice={selectedInvoice}
          selectedProduct={selectedProduct}
          selectedApproval={selectedApproval}
          selectedFulfillment={selectedFulfillment}
          onNavigate={handleNavigateWrapper}
        />
      </div>
    </div>
  );
}
