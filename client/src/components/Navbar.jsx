import React from 'react';
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
  House,
  Users,
  LogIn
} from "lucide-react";

export default function Navbar({ currentTab, onNavigate }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <House size={16} /> },
    { id: "quotations", label: "Quotations", icon: <CircleStar size={16} /> },
    { id: "approvals", label: "Approvals", icon: <CircleCheck size={16} /> },
    { id: "fulfillment", label: "Fulfillment", icon: <Package size={16} /> },
    { id: "subscriptions", label: "Subscriptions", icon: <RefreshCw size={16} /> },
    { id: "invoices", label: "Invoices", icon: <Receipt size={16} /> },
    { id: "deal-health", label: "Deal Health", icon: <HeartPulse size={16} /> },
    { id: "reports", label: "Reports", icon: <BarChart3 size={16} /> },
    { id: "product", label: "Product", icon: <Box size={16} /> },
    { id: "customer-portal", label: "Customer Portal", icon: <Users size={16} /> },
    { id: "auth", label: "Login / Signup", icon: <LogIn size={16} /> }
  ];

  return (
    <nav className="navbar">
      <div className="logo">DealFlow360</div>
      <div className="nav-links">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={
              currentTab === item.id || 
              (item.id === 'approvals' && currentTab === 'approval-detail') || 
              (item.id === 'fulfillment' && (currentTab === 'fulfillment-list' || currentTab === 'fulfillment-detail')) 
                ? "active" 
                : ""
            }
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.id === 'fulfillment' ? 'fulfillment-list' : item.id);
            }}
          >
            {item.icon} {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
