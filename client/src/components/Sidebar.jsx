import React from "react";
import {
  House,
  CircleStar,
  CircleCheck,
  Package,
  RefreshCw,
  Receipt,
  ClipboardList,
  HeartPulse,
  BarChart3,
  Box,
  Users,
  LogOut,
  Hexagon,
  Sparkles
} from "lucide-react";

export default function Sidebar({ currentTab, onNavigate }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <House size={18} /> },
    { id: "quotations", label: "Quotations", icon: <CircleStar size={18} /> },
    { id: "approvals", label: "Approvals", icon: <CircleCheck size={18} /> },
    { id: "fulfillment", label: "Fulfillment", icon: <Package size={18} /> },
    { id: "orders", label: "Orders", icon: <ClipboardList size={18} /> },
    { id: "subscriptions", label: "Subscriptions", icon: <RefreshCw size={18} /> },
    { id: "invoices", label: "Invoices", icon: <Receipt size={18} /> },
    { id: "deal-health", label: "Deal Health", icon: <HeartPulse size={18} /> },
    { id: "reports", label: "Reports", icon: <BarChart3 size={18} /> },
    { id: "product", label: "Product", icon: <Box size={18} /> },
    { id: "customer-portal", label: "Customer Portal", icon: <Users size={18} /> }
  ];

  const isItemActive = (id) => {
    if (currentTab === id) return true;
    if (id === "approvals" && currentTab === "approval-detail") return true;
    if (id === "fulfillment" && (currentTab === "fulfillment-list" || currentTab === "fulfillment-detail")) return true;
    if (id === "subscriptions" && currentTab === "billing-detail") return true;
    if (id === "product" && currentTab === "product-detail") return true;
    return false;
  };

  const handleItemClick = (e, id) => {
    e.preventDefault();
    if (id === "fulfillment") {
      onNavigate("fulfillment-list");
    } else {
      onNavigate(id);
    }
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-icon">
          <Hexagon size={24} className="brand-hex" />
          <Sparkles size={12} className="brand-sparkle" />
        </div>
        <div className="brand-info">
          <span className="brand-name">DealFlow360</span>
          <span className="brand-tagline">Sales & Operations</span>
        </div>
      </div>

      {/* Profile / Workspace Greeting Card (Figma Style) */}
      <div className="sidebar-profile-card">
        <div className="profile-icon-wrapper">
          <div className="profile-hex-badge">
            <span className="profile-initials">DF</span>
          </div>
        </div>
        <div className="profile-details">
          <span className="greeting-title">Welcome Home!</span>
          <span className="greeting-subtitle">Bestro Enterprise Hub</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav-section">
        <span className="nav-group-label">APPLICATION MODULES</span>
        <nav className="sidebar-nav-list">
          {navItems.map((item) => {
            const active = isItemActive(item.id);
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`sidebar-nav-item ${active ? "active" : ""}`}
                onClick={(e) => handleItemClick(e, item.id)}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span className="nav-item-label">{item.label}</span>
                {active && <span className="active-indicator" />}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-logout-btn"
          onClick={() => onNavigate("auth")}
        >
          <LogOut size={16} className="logout-icon" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
