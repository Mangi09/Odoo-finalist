import React from 'react';
<<<<<<< HEAD
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Dashboard.css';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="main-content">
        <Topbar toggleSidebar={toggleSidebar} />
        <div className="dashboard-page">
          {children}
        </div>
      </main>
    </div>
  );
=======

/**
 * Multi-developer safety wrapper.
 * Ensures teammate pages importing DashboardLayout (e.g. QuotationDetailPage, InvoiceDetailPage)
 * compile and mount cleanly inside the application shell.
 */
export default function DashboardLayout({ children }) {
  return <div className="dashboard-layout-inner">{children}</div>;
>>>>>>> origin/vibha
}
