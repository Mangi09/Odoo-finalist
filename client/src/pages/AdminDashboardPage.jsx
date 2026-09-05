import React from "react";
import "../App.css";

export default function AdminDashboardPage() {
  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header">
          <div className="page-header-left">
            <span className="ops-label">Admin / Reporting</span>
            <h1>Admin / Reporting Dashboard (Optional)</h1>
            <p className="subtitle">Sales funnels, approval bottlenecks and platform usage.</p>
          </div>
        </div>

        <div className="mini-card-grid">
          <div className="mini-card"><div className="mini-card-title">Sales Funnel</div><div className="mini-card-value">12 active</div></div>
          <div className="mini-card"><div className="mini-card-title">Approval Bottleneck</div><div className="mini-card-value">3 pending</div></div>
          <div className="mini-card"><div className="mini-card-title">Top Upsell Product</div><div className="mini-card-value">Care Plan 2yr</div></div>
          <div className="mini-card"><div className="mini-card-title">Avg Approval Time</div><div className="mini-card-value">1.4 days</div></div>
        </div>
      </div>

      <div className="page-card">
        <div className="button-row">
          <button className="btn-outline">Export PDF</button>
          <button className="btn-outline">Export XLS</button>
        </div>
      </div>
    </main>
  );
}
