import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { Download, Printer, RefreshCw, TrendingUp, AlertOctagon, CheckCircle2, Clock } from "lucide-react";

export default function AdminDashboardPage({ onNavigate }) {
  const [kpis, setKpis] = useState({});
  const [lifecycle, setLifecycle] = useState([]);
  const [attentionItems, setAttentionItems] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [kpiRes, lifeRes, attRes] = await Promise.allSettled([
        api.reports.getKpis(),
        api.reports.getLifecycle(),
        api.reports.getAttention()
      ]);

      if (kpiRes.status === 'fulfilled' && kpiRes.value) {
        setKpis(kpiRes.value);
      }
      if (lifeRes.status === 'fulfilled' && Array.isArray(lifeRes.value)) {
        setLifecycle(lifeRes.value);
      }
      if (attRes.status === 'fulfilled' && Array.isArray(attRes.value)) {
        setAttentionItems(attRes.value);
      }
    } catch (err) {
      console.warn("Reports API error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportXLS = () => {
    // Generate clean CSV format
    let csv = "DEALFLOW360 EXECUTIVE REPORT\n\n";
    csv += "KEY METRICS\n";
    csv += `Active Deals,${kpis.activeDeals?.value || '0'}\n`;
    csv += `Revenue Pipeline,${kpis.revenuePipeline?.value || '₹0.0L'}\n`;
    csv += `Pending Approvals,${kpis.pendingApprovals?.value || '0'}\n`;
    csv += `Payments Collected,${kpis.paymentsCollected?.value || '₹0.0L'}\n\n`;

    csv += "DEAL LIFECYCLE FUNNEL\n";
    csv += "Stage,Count,Avg Time,Completion Rate\n";
    lifecycle.forEach(l => {
      csv += `"${l.name}",${l.count},"${l.avgTime}","${l.completionRate}"\n`;
    });

    csv += "\nITEMS NEEDING ATTENTION\n";
    csv += "Type,Deal,Detail,Severity\n";
    attentionItems.forEach(a => {
      csv += `"${a.type}","${a.deal}","${a.detail}","${a.severity}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dealflow360_executive_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="page-header-left">
            <span className="ops-label">Executive Intelligence</span>
            <h1>DealFlow360 Executive & Operations Dashboard</h1>
            <p className="subtitle">Live revenue pipeline, conversion funnels, approval bottlenecks, and fulfillment velocity.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-outline" onClick={loadReportData} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
            <button className="btn-outline" onClick={handleExportPDF} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Printer size={15} />
              <span>Export PDF</span>
            </button>
            <button className="btn-primary" onClick={handleExportXLS} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Download size={15} />
              <span>Export XLS / CSV</span>
            </button>
          </div>
        </div>

        {/* Live KPI Metric Cards */}
        <div className="mini-card-grid">
          <div className="mini-card">
            <div className="mini-card-title">Active Deals in Pipeline</div>
            <div className="mini-card-value" style={{ color: "#2563eb" }}>
              {kpis.activeDeals?.value || "0"}
            </div>
            <small style={{ color: "#64748b" }}>{kpis.activeDeals?.context || "assigned customers"}</small>
          </div>

          <div className="mini-card">
            <div className="mini-card-title">Revenue Pipeline</div>
            <div className="mini-card-value" style={{ color: "#16a34a" }}>
              {kpis.revenuePipeline?.value || "₹0.0L"}
            </div>
            <small style={{ color: "#64748b" }}>{kpis.revenuePipeline?.context || "Across open proposals"}</small>
          </div>

          <div className="mini-card">
            <div className="mini-card-title">Pending Approvals</div>
            <div className="mini-card-value" style={{ color: "#d97706" }}>
              {kpis.pendingApprovals?.value || "0"}
            </div>
            <small style={{ color: "#64748b" }}>{kpis.pendingApprovals?.context || "Needs manager review"}</small>
          </div>

          <div className="mini-card">
            <div className="mini-card-title">Payments Collected</div>
            <div className="mini-card-value" style={{ color: "#7c3aed" }}>
              {kpis.paymentsCollected?.value || "₹0.0L"}
            </div>
            <small style={{ color: "#64748b" }}>{kpis.paymentsCollected?.context || "Captured revenue"}</small>
          </div>
        </div>
      </div>

      {/* Deal Lifecycle Stages Funnel */}
      <div className="page-card">
        <h2 style={{ marginBottom: "14px" }}>Quote-to-Cash Deal Lifecycle Velocity</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Lifecycle Stage</th>
                <th>Active Deals</th>
                <th>Avg Cycle Time</th>
                <th>Stage Conversion</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lifecycle.length > 0 ? lifecycle.map((stage, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: "#1a365d" }}>{stage.name}</td>
                  <td><strong>{stage.count}</strong> deals</td>
                  <td>{stage.avgTime}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ flex: 1, height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden", maxWidth: "80px" }}>
                        <div style={{ width: stage.completionRate, height: "100%", background: "#3b82f6" }}></div>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 500 }}>{stage.completionRate}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge green">Healthy</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5">No report data found for assigned customers.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Items Needing Immediate Attention */}
      <div className="page-card">
        <h2 style={{ marginBottom: "14px" }}>Operational Bottlenecks & Attention Queue</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Deal / Reference</th>
                <th>Observation</th>
                <th>Urgency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attentionItems.length > 0 ? attentionItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{item.type}</td>
                  <td style={{ color: "#1a365d", fontWeight: 600 }}>{item.deal}</td>
                  <td>{item.detail}</td>
                  <td>
                    <span className={`badge ${item.severity === 'High' ? 'red' : 'orange'}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-outline"
                      style={{ padding: "3px 8px", fontSize: "11px" }}
                      onClick={() => {
                        if (item.type.includes("Approval")) onNavigate && onNavigate("approvals");
                        else if (item.type.includes("Fulfillment")) onNavigate && onNavigate("fulfillment-list");
                        else onNavigate && onNavigate("invoices");
                      }}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5">No attention items found for assigned customers.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
