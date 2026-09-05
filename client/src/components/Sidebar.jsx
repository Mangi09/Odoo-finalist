import React from 'react';
import {
  LayoutDashboard, FileText, ReceiptText, HeartPulse, ShieldCheck, LogOut
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Quotations', path: '/quotations' },
    { icon: ReceiptText, label: 'Invoices', path: '/invoices' },
    { icon: HeartPulse, label: 'Deal Health', path: '/deal-health' },
    { icon: ShieldCheck, label: 'Admin / Reports', path: '/admin-reports' }
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Logo />
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-label">MAIN NAVIGATION</div>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={index}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
