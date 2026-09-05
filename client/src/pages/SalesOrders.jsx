import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { RefreshCw } from "lucide-react";

const initialOrders = [
  { id: "SO-1042", customer: "Acme Corp", source: "Q-1042", status: "Fulfillment Pending", invoice: "INV-1042" },
  { id: "SO-1041", customer: "Acme Corp", source: "Q-1041", status: "Partial", invoice: "INV-1043" },
  { id: "SO-1038", customer: "Nova Retail", source: "Q-1038", status: "Delivered", invoice: "INV-1038" },
];

export default function SalesOrders({ onNavigate }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSalesOrders();
  }, []);

  const loadSalesOrders = async () => {
    setLoading(true);
    try {
      const data = await api.salesOrders.getAll();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((o, idx) => ({
          _id: o._id,
          id: o.orderNumber || `SO-2026-${String(idx + 1).padStart(4, '0')}`,
          customer: o.customer || o.customerId?.name || "Customer Corp",
          source: o.quotationNumber || `Q-${o._id.toString().slice(-4).toUpperCase()}`,
          status: o.status === 'CONFIRMED' ? 'Fulfillment Pending' : (o.status === 'PAID' ? 'Delivered' : o.status),
          invoice: `INV-${o._id.toString().slice(-4).toUpperCase()}`,
          totalAmount: o.totalAmount
        }));

        const existingIds = new Set(mapped.map(m => m.id));
        const combined = [...mapped, ...initialOrders.filter(d => !existingIds.has(d.id))];
        setOrders(combined);
      }
    } catch (err) {
      console.warn("SalesOrders API fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

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

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Source Quote</th>
                <th>Execution Status</th>
                <th>Invoice Ref</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id || order.id}
                  onClick={() => onNavigate && onNavigate("fulfillment-list", { order: order.source, customer: order.customer, status: "Split Pending", warehouses: "Main + East Depot" })}
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ fontWeight: 600, color: "#1a365d" }}>{order.id}</td>
                  <td>{order.customer}</td>
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
