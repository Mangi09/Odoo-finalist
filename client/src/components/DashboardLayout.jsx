import React from 'react';
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
}
