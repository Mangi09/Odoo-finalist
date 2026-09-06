import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { RefreshCw } from "lucide-react";

export default function SalesOrders({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const role = JSON.parse(localStorage.getItem('dealflow-user') || '{}')?.role;

  useEffect(() => {
    loadSalesOrders();
  }, []);

  const loadSalesOrders = async () => {
    setLoading(true);
    try {
      const data = await api.salesOrders.getAll();
      if (Array.isArray(data)) {
        const mapped = data.map((o, idx) => ({
          _id: o._id,
          id: o.orderNumber || `SO-2026-${String(idx + 1).padStart(4, '0')}`,
          customer: o.customer || o.customerId?.name || "Customer Corp",
          source: o.quotationNumber || (o.quotationId?.quotationNumber) || "",
          status: o.status === 'CONFIRMED' ? 'Fulfillment Pending' : (o.status === 'PAID' ? 'Delivered' : o.status),
          invoice: o.invoiceNumber || "",
          totalAmount: o.totalAmount,
          salesperson: o.salesperson || 'Unassigned'
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.warn("Could not load sales orders:", err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const text = `${order.id} ${order.customer} ${order.salesperson} ${order.source} ${order.invoice} ${order.status}`.toLowerCase();
    return (statusFilter === "all" || order.status === statusFilter) && text.includes(searchFilter.toLowerCase());
  });

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="page-header-left">
            <span className="ops-label">Sales Orders</span>
            <h1>Sales / Order List</h1>
            <p className="subtitle">Confirmed quotations that now drive warehouse fulfillment, recurring subscriptions and billing invoices.</p>
          </div>
          <button className="btn-outline" onClick={loadSalesOrders} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="filter-section" style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "14px 0" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "13px" }}
          >
            <option value="all">All Statuses</option>
            {[...new Set(orders.map(order => order.status).filter(Boolean))].map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by order, customer, salesperson, quote, invoice..."
            style={{ flex: 1, minWidth: "220px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "13px" }}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Salesperson</th>
                <th>Source Quote</th>
                <th>Execution Status</th>
                <th>Invoice Ref</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order._id || order.id}
                  onClick={() => role !== 'salesperson' && onNavigate && onNavigate("fulfillment-list", { order: order.source, customer: order.customer, status: "Split Pending", warehouses: "Main + East Depot" })}
                  style={{ cursor: role === 'salesperson' ? "default" : "pointer" }}
                >
                  <td style={{ fontWeight: 600, color: "#1a365d" }}>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.salesperson}</td>
                  <td>{order.source}</td>
                  <td>
                    <span className={`badge ${order.status === "Delivered" ? "green" : (order.status.includes("Pending") ? "orange" : "blue")}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{order.invoice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box">
          Confirmed customer quotes create an immutable SalesOrder record, automatically reserving warehouse stock, provisioning subscription lines, and queuing invoice collection.
        </div>

        <div className="button-row" style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button className="btn-primary" onClick={() => onNavigate && onNavigate("subscriptions")}>View Subscriptions</button>
          <button className="btn-outline" onClick={() => onNavigate && onNavigate("invoices")}>View Invoices</button>
        </div>
      </div>
    </main>
  );
}
