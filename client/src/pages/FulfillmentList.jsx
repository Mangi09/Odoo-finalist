import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { RefreshCw } from "lucide-react";

export default function FulfillmentList({ onNavigate }) {
  const [warehouseStock, setWarehouseStock] = useState([
    { warehouse: "Main Warehouse", product: "Laptop Pro 14", inStock: 40, reserved: 18, available: 22 },
    { warehouse: "East Depot", product: "Laptop Pro 14", inStock: 10, reserved: 6, available: 4 },
    { warehouse: "Main Warehouse", product: "Docking Station", inStock: 65, reserved: 12, available: 53 },
    { warehouse: "West Hub", product: "NovaBook Ultra 16", inStock: 30, reserved: 8, available: 22 },
  ]);

  const [ordersAwaiting, setOrdersAwaiting] = useState([
    { order: "Q-1042", customer: "Acme Corp", status: "Split Pending", warehouses: "Main + East Depot" },
    { order: "Q-1030", customer: "Zenith Co", status: "Backorder", warehouses: "East Depot" },
    { order: "Q-1039", customer: "Beta Industries", status: "Reserved", warehouses: "Main Warehouse" },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFulfillments();
  }, []);

  const loadFulfillments = async () => {
    setLoading(true);
    try {
      const data = await api.fulfillments.getAll();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((f, idx) => ({
          _id: f._id,
          order: f.orderNumber || f.salesOrderId?.orderNumber || `SO-2026-${idx + 1040}`,
          customer: f.customer || f.salesOrderId?.customer || "Customer Corp",
          status: f.status === 'RESERVED' ? 'Split Pending' : (f.status === 'DELIVERED' ? 'Fulfilled' : f.status),
          warehouses: f.warehouseName || (f.allocations?.map(a => a.warehouse).join(' + ')) || "Main Warehouse"
        }));

        const existing = new Set(mapped.map(m => m.order));
        const combined = [...mapped, ...ordersAwaiting.filter(o => !existing.has(o.order))];
        setOrdersAwaiting(combined);
      }
    } catch (err) {
      console.warn("Fulfillments API notice:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="page-header-left">
            <span className="ops-label">Logistics & Warehousing</span>
            <h1>Fulfillment and Stock Master</h1>
            <p className="subtitle">
              Live physical stock per depot warehouse, split-allocation queues, and backorder consolidation.
            </p>
          </div>
          <button className="btn-outline" onClick={loadFulfillments} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Warehouse Depot</th>
                <th>Product SKU</th>
                <th>In Stock</th>
                <th>Reserved</th>
                <th>Available</th>
              </tr>
            </thead>
            <tbody>
              {warehouseStock.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: "#1a365d" }}>{item.warehouse}</td>
                  <td>{item.product}</td>
                  <td>{item.inStock}</td>
                  <td style={{ color: "#d97706", fontWeight: 500 }}>{item.reserved}</td>
                  <td style={{ color: "#16a34a", fontWeight: 600 }}>{item.available}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{ fontSize: "16px", color: "#2b6cb0", marginTop: "32px", marginBottom: "16px", fontWeight: "600" }}>
          Orders Awaiting Physical Fulfillment ({ordersAwaiting.length})
        </h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Fulfillment Status</th>
                <th>Assigned Warehouses</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ordersAwaiting.map((order, idx) => (
                <tr
                  key={order._id || idx}
                  onClick={() => onNavigate && onNavigate("fulfillment-detail", order)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ fontWeight: 600, color: "#1a365d" }}>{order.order}</td>
                  <td>{order.customer}</td>
                  <td>
                    <span className={`badge ${order.status.includes('Fulfilled') ? 'green' : (order.status.includes('Backorder') ? 'red' : 'orange')}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.warehouses}</td>
                  <td>
                    <button
                      className="btn-outline"
                      style={{ padding: "3px 8px", fontSize: "11px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate && onNavigate("fulfillment-detail", order);
                      }}
                    >
                      Inspect Split
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box" style={{ background: "#fefcbf", color: "#744210", borderLeftColor: "#ecc94b", marginTop: "20px" }}>
          Click an order row to open its warehouse split detail, review freight estimations, and execute manual overrides.
        </div>
      </div>
    </main>
  );
}
