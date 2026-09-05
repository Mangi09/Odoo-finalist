import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { AlertTriangle, UserCheck, ShieldAlert, RefreshCw, CheckCircle2 } from "lucide-react";

export default function DealHealthPage({ onNavigate }) {
  const [anomalies, setAnomalies] = useState([
    { id: "1", deal: "Q-1042", customer: "Acme Corp", reason: "No reply in 5 days", flagged: "Aug 21", owner: "Sales Manager", severity: "High" },
    { id: "2", deal: "Q-1038", customer: "Nova Retail", reason: "Budget not confirmed", flagged: "Aug 20", owner: "Finance", severity: "Medium" },
    { id: "3", deal: "Q-1039", customer: "Beta Industries", reason: "Escalated to Manager", flagged: "Aug 18", owner: "Account Manager", severity: "Critical" },
  ]);

  const [metrics, setMetrics] = useState({
    stalled: "3 quotes over 7 days",
    anomalies: "2 above average",
    slippage: "1 partial delay"
  });

  const [selectedDeal, setSelectedDeal] = useState(anomalies[0]);
  const [assigningRep, setAssigningRep] = useState(false);
  const [selectedRep, setSelectedRep] = useState("Atharva (Lead Rep)");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDealHealth();
  }, []);

  const loadDealHealth = async () => {
    setLoading(true);
    try {
      const data = await api.dealHealth.getDashboard();
      if (data) {
        if (data.summary) {
          setMetrics({
            stalled: `${data.summary.atRisk || 2} at risk`,
            anomalies: `${data.summary.critical || 1} critical`,
            slippage: `${data.summary.healthy || 5} healthy deals`
          });
        }
        if (Array.isArray(data.anomalies) && data.anomalies.length > 0) {
          const mapped = data.anomalies.map(a => ({
            id: a.id || a.deal,
            deal: a.deal || "Q-1042",
            customer: a.customer || "Acme Corp",
            reason: a.description || "Inactivity flag",
            flagged: "Recent",
            owner: a.severity === 'Critical' ? 'Sales Manager' : 'Account Rep',
            severity: a.severity || 'Medium'
          }));
          setAnomalies(mapped);
          setSelectedDeal(mapped[0]);
        }
      }
    } catch (err) {
      console.warn("Using default deal health fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = () => {
    if (!selectedDeal) return;
    setAnomalies(prev =>
      prev.map(item =>
        item.deal === selectedDeal.deal
          ? { ...item, reason: `[ESCALATED TO VP] ${item.reason}`, owner: "VP of Sales" }
          : item
      )
    );
    setNotification({
      type: "danger",
      text: `Deal ${selectedDeal.deal} (${selectedDeal.customer}) has been escalated to VP of Sales with highest executive priority.`
    });
  };

  const handleAssignRep = () => {
    if (!selectedDeal) return;
    setAnomalies(prev =>
      prev.map(item =>
        item.deal === selectedDeal.deal
          ? { ...item, owner: selectedRep }
          : item
      )
    );
    setNotification({
      type: "success",
      text: `Deal ${selectedDeal.deal} reassigned to ${selectedRep}. An update alert was queued.`
    });
    setAssigningRep(false);
  };

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="page-header-left">
            <span className="ops-label">Deal Health Dashboard</span>
            <h1>Deal Health and Anomaly Dashboard</h1>
            <p className="subtitle">Real-time risk scoring, inactivity detection, and margin erosion monitoring.</p>
          </div>
          <button className="btn-outline" onClick={loadDealHealth} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {notification && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            background: notification.type === 'danger' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${notification.type === 'danger' ? '#fca5a5' : '#86efac'}`,
            color: notification.type === 'danger' ? '#991b1b' : '#166534',
            fontWeight: 500,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            {notification.type === 'danger' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
            {notification.text}
          </div>
        )}

        <div className="mini-card-grid">
          <div className="mini-card">
            <div className="mini-card-title">Stalled Deals</div>
            <div className="mini-card-value" style={{ color: "#d97706" }}>{metrics.stalled}</div>
          </div>
          <div className="mini-card">
            <div className="mini-card-title">Discount Anomalies</div>
            <div className="mini-card-value" style={{ color: "#dc2626" }}>{metrics.anomalies}</div>
          </div>
          <div className="mini-card">
            <div className="mini-card-title">Healthy Pipeline</div>
            <div className="mini-card-value" style={{ color: "#16a34a" }}>{metrics.slippage}</div>
          </div>
        </div>
      </div>

      <div className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0 }}>Flagged Deal Anomalies</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Selected: <strong style={{ color: '#1a365d' }}>{selectedDeal?.deal} ({selectedDeal?.customer})</strong>
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: "40px" }}>Select</th>
                <th>Deal</th>
                <th>Customer</th>
                <th>Risk Severity</th>
                <th>Anomaly Reason</th>
                <th>Flagged</th>
                <th>Current Owner</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((row) => (
                <tr
                  key={row.deal}
                  onClick={() => setSelectedDeal(row)}
                  style={{
                    cursor: "pointer",
                    background: selectedDeal?.deal === row.deal ? "#f1f5f9" : "transparent"
                  }}
                >
                  <td>
                    <input
                      type="radio"
                      name="selectedDeal"
                      checked={selectedDeal?.deal === row.deal}
                      onChange={() => setSelectedDeal(row)}
                    />
                  </td>
                  <td style={{ fontWeight: 600, color: "#1a365d" }}>{row.deal}</td>
                  <td>{row.customer}</td>
                  <td>
                    <span className={`badge ${row.severity === 'Critical' ? 'red' : (row.severity === 'High' ? 'orange' : 'yellow')}`}>
                      {row.severity || 'Medium'}
                    </span>
                  </td>
                  <td>{row.reason}</td>
                  <td>{row.flagged}</td>
                  <td style={{ fontWeight: 500 }}>{row.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {assigningRep && (
          <div style={{ marginTop: "16px", padding: "14px", background: "#f8fafc", border: "1px solid #cbd5e0", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 8px 0" }}>Assign Deal to Representative</h4>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "13px" }}
              >
                <option value="Atharva (Senior Sales Rep)">Atharva (Senior Sales Rep)</option>
                <option value="M. Shah (Sales Manager)">M. Shah (Sales Manager)</option>
                <option value="R. Iyer (Strategic Accounts)">R. Iyer (Strategic Accounts)</option>
                <option value="Priya Sharma (Deal Desk)">Priya Sharma (Deal Desk)</option>
              </select>
              <button className="btn-primary" onClick={handleAssignRep}>
                Confirm Assignment
              </button>
              <button className="btn-outline" onClick={() => setAssigningRep(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="button-row" style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
          <button className="btn-danger" onClick={handleEscalate} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldAlert size={16} />
            <span>Escalate Selected Deal</span>
          </button>
          <button className="btn-primary" onClick={() => setAssigningRep(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <UserCheck size={16} />
            <span>Assign Rep</span>
          </button>
          <button
            className="btn-outline"
            onClick={() => onNavigate && onNavigate("quotation-detail", { id: selectedDeal?.deal || "Q-1042", customer: selectedDeal?.customer || "Acme Corp" })}
          >
            Open Deal Details
          </button>
        </div>
      </div>
    </main>
  );
}
