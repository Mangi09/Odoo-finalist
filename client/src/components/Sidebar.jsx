import React from "react";
import {
  LayoutDashboard,
  CircleStar,
  CircleCheck,
  Package,
  RefreshCw,
  Receipt,
  HeartPulse,
  BarChart3,
  Box,
  Users,
  LogOut
} from "lucide-react";
import Logo from "./Logo";

export default function Sidebar({ currentTab, onNavigate }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "quotations", label: "Quotations", icon: <CircleStar size={18} /> },
    { id: "approvals", label: "Approvals", icon: <CircleCheck size={18} /> },
    { id: "fulfillment", label: "Fulfillment", icon: <Package size={18} /> },
    { id: "subscriptions", label: "Subscriptions", icon: <RefreshCw size={18} /> },
    { id: "invoices", label: "Invoices", icon: <Receipt size={18} /> },
    { id: "deal-health", label: "Deal Health", icon: <HeartPulse size={18} /> },
    { id: "reports", label: "Admin / Reports", icon: <BarChart3 size={18} /> },
    { id: "product", label: "Products", icon: <Box size={18} /> },
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
    <aside className="sidebar">
      <div className="sidebar-header">
        <Logo />
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-label">MAIN NAVIGATION</div>
        {navItems.map((item) => {
          const active = isItemActive(item.id);
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={(e) => handleItemClick(e, item.id)}
            >
              {item.icon}
              <span className="nav-item-label">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="nav-item logout"
          onClick={() => onNavigate("auth")}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
