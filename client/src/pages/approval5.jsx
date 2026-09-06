import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { RefreshCw } from "lucide-react";

function Approvals({ onNavigate }) {
  const [approvals, setApprovals] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const data = await api.approvals.getAll();
      if (Array.isArray(data)) {
        const mapped = data.map(item => ({
          _id: item._id,
          quotation: item.quotation,
          quotationId: item.quotationId,
          customer: item.customer,
          salesperson: item.salesperson,
          risk: item.risk,
          stage: item.stage,
          assigned: item.assigned,
          status: item.status,
          marginImpact: item.marginImpact,
          requestedDiscount: item.requestedDiscount,
          allowedDiscount: item.allowedDiscount,
          reason: item.reason,
        }));

        setApprovals(mapped);
      }
    } catch (err) {
      console.warn("Could not load approvals:", err.message);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = approvals.filter(a => a.status === "PENDING").length;
  const returnedCount = approvals.filter(a => a.status === "RETURNED" || a.status === "REJECTED" || a.stage?.toLowerCase().includes("return") || a.stage?.toLowerCase().includes("reject")).length;
  const approvedCount = approvals.filter(a => a.status === "APPROVED" || a.stage?.toLowerCase().includes("auto-approved")).length;

  const filteredApprovals = approvals.filter((a) => {
    if (filter === "all") return true;
    if (filter === "pending") return a.status === "PENDING" && !a.stage?.toLowerCase().includes("return") && !a.stage?.toLowerCase().includes("reject");
    if (filter === "returned") return a.status === "RETURNED" || a.status === "REJECTED" || a.stage?.toLowerCase().includes("return") || a.stage?.toLowerCase().includes("reject");
    if (filter === "approved") return a.status === "APPROVED" || a.stage?.toLowerCase().includes("auto-approved");
    return true;
  });

  return (
    <main className="content">
      <div className="page-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: 0 }}>Approvals (List)</h1>
            <p className="subtitle">
              Every quotation that needed, needs, or is going through discount approval
            </p>
          </div>
          <button className="btn-outline" onClick={loadApprovals} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Status Cards with interactive filter clicking */}
        <div className="status-container" style={{ cursor: "pointer" }}>
          <div
            className={`status pending ${filter === "pending" ? "active-filter" : ""}`}
            onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
            title="Click to filter Pending"
            style={{ outline: filter === "pending" ? "2px solid #f49a00" : "none" }}
          >
            <span>{pendingCount} Pending</span>
          </div>

          <div
            className={`status returned ${filter === "returned" ? "active-filter" : ""}`}
            onClick={() => setFilter(filter === "returned" ? "all" : "returned")}
            title="Click to filter Returned"
            style={{ outline: filter === "returned" ? "2px solid #e82d32" : "none" }}
          >
            <span>{returnedCount} Rejected/Returned</span>
          </div>

          <div
            className={`status approved ${filter === "approved" ? "active-filter" : ""}`}
            onClick={() => setFilter(filter === "approved" ? "all" : "approved")}
            title="Click to filter Approved"
            style={{ outline: filter === "approved" ? "2px solid #299b45" : "none" }}
          >
            <span>{approvedCount} Approved</span>
          </div>
        </div>

        {/* Filter dropdown */}
        <div className="filter-section" style={{ display: "flex", alignItems: "center", gap: "10px", margin: "14px 0" }}>
          <label htmlFor="filter" style={{ fontWeight: 600, fontSize: "13px" }}>Filter View:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "13px" }}
          >
            <option value="all">All Approvals ({approvals.length})</option>
            <option value="pending">Pending Only ({pendingCount})</option>
            <option value="returned">Rejected/Returned ({returnedCount})</option>
            <option value="approved">Approved ({approvedCount})</option>
          </select>
        </div>

        {/* Approval Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Quotation</th>
                <th>Customer</th>
                <th>Salesperson</th>
                <th>Blended Risk</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Assigned To</th>
              </tr>
            </thead>

            <tbody>
              {filteredApprovals.length > 0 ? (
                filteredApprovals.map((approval, index) => (
                  <tr
                    key={approval._id || index}
                    onClick={() => onNavigate && onNavigate("approval-detail", approval)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ fontWeight: 600, color: "#1a365d" }}>{approval.quotation}</td>
                    <td>{approval.customer}</td>
                    <td>{approval.salesperson || 'Unassigned'}</td>
                    <td>
                      <span className={`badge ${approval.risk === "HIGH" ? "red" : (approval.risk === "MEDIUM" ? "orange" : "green")}`}>
                        {approval.risk}
                      </span>
                    </td>
                    <td>{approval.stage}</td>
                    <td>
                      <span className={`badge ${approval.status === "REJECTED" ? "red" : (approval.status === "APPROVED" ? "green" : "orange")}`}>
                        {approval.status}
                      </span>
                    </td>
                    <td>{approval.status === "REJECTED" ? (approval.reason || "Rejected") : (approval.reason || "-")}</td>
                    <td>{approval.assigned}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "#718096" }}>
                    No approvals match the selected filter ({filter}).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Information Box */}
        <div className="info-box" style={{ marginTop: "16px" }}>
          Click any row to open its full approval detail, risk breakdown, and audit trail.
        </div>
      </div>
    </main>
  );
}

export default Approvals;
