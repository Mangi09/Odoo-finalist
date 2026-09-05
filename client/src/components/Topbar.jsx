import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

export default function Topbar({ toggleSidebar }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="breadcrumb">Dashboard</div>
      </div>
      
      <div className="topbar-right">
        <button className="icon-btn" aria-label="Search">
          <Search size={20} />
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className="topbar-avatar"></div>
      </div>
    </header>
  );
}
