import React from 'react';

/**
 * Multi-developer safety wrapper.
 * Ensures teammate pages importing DashboardLayout (e.g. QuotationDetailPage, InvoiceDetailPage)
 * compile and mount cleanly inside the application shell.
 */
export default function DashboardLayout({ children }) {
  return <div className="dashboard-layout-inner">{children}</div>;
}
