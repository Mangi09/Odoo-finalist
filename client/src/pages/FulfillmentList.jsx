import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { RefreshCw } from "lucide-react";

export default function FulfillmentList({ onNavigate }) {
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [ordersAwaiting, setOrdersAwaiting] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentRole = (() => {
    try {
      return JSON.parse(localStorage.getItem('dealflow-user') || '{}')?.role;
    } catch {
      return null;
    }
  })();
  const isAdmin = currentRole === 'admin';

  useEffect(() => {
    loadFulfillments();
  }, []);

  const loadFulfillments = async () => {
    setLoading(true);
    try {
      const [fulfillments, stock, warehouseRes] = await Promise.allSettled([
        api.fulfillments.getAll(),
        api.fulfillments.getStock(),
        isAdmin ? api.warehouses.getAll() : Promise.resolve([]),
      ]);
      if (stock.status === 'fulfilled' && Array.isArray(stock.value)) {
        setWarehouseStock(stock.value);
      }
      if (warehouseRes.status === 'fulfilled' && Array.isArray(warehouseRes.value)) {
        setWarehouses(warehouseRes.value);
      }
      if (fulfillments.status === 'fulfilled' && Array.isArray(fulfillments.value)) {
        const warehouseByOrder = fulfillments.value.reduce((acc, item) => {
          const key = item.salesOrderNumber || item.salesOrderId || item._id;
          acc[key] = acc[key] ? `${acc[key]} + ${item.warehouse}` : item.warehouse;
          return acc;
        }, {});
        const mapped = fulfillments.value.map((f, idx) => ({
          _id: f._id,
          order: f.salesOrderNumber || f.salesOrderId?.orderNumber || `FUL-${idx + 1}`,
          customer: f.customer || f.salesOrderId?.customer || "Customer Corp",
          salesperson: f.salesperson || 'Unassigned',
          warehouse: f.warehouse || f.warehouseName || 'Warehouse',
          status: f.status === 'RESERVED' ? 'Split Pending' : (f.status === 'DELIVERED' ? 'Fulfilled' : f.status),
          warehouses: warehouseByOrder[f.salesOrderNumber || f.salesOrderId || f._id] || f.warehouse || 'Warehouse'
        }));
        setOrdersAwaiting(mapped);
      }
    } catch (err) {
      console.warn("Fulfillments API notice:", err.message);
      setWarehouseStock([]);
      setWarehouses([]);
      setOrdersAwaiting([]);
    } finally {
      setLoading(false);
    }
  };

  const archiveWarehouse = async (warehouse) => {
    if (!window.confirm(`Archive warehouse ${warehouse.name}?`)) return;
    await api.warehouses.archive(warehouse._id);
    await loadFulfillments();
  };

  const editWarehouse = async (warehouse) => {
    const name = window.prompt("Warehouse name", warehouse.name);
    if (!name) return;
    const location = window.prompt("Warehouse location", warehouse.location || "");
    if (location === null) return;
    const priorityValue = window.prompt("Warehouse priority", String(warehouse.priority || 1));
    if (priorityValue === null) return;
    await api.warehouses.update(warehouse._id, {
      name,
      location,
      priority: Number(priorityValue) || 1,
    });
    await loadFulfillments();
  };

  const deleteWarehouse = async (warehouse) => {
    if (!window.confirm(`Delete warehouse ${warehouse.name}? This cannot be undone.`)) return;
    await api.warehouses.delete(warehouse._id);
    await loadFulfillments();
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

        {isAdmin && (
          <>
            <h2 style={{ fontSize: "16px", color: "#2b6cb0", marginTop: "32px", marginBottom: "16px", fontWeight: "600" }}>
              Warehouse Management ({warehouses.length})
            </h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Warehouse</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((warehouse) => (
                    <tr key={warehouse._id}>
                      <td style={{ fontWeight: 600, color: "#1a365d" }}>{warehouse.name}</td>
                      <td>{warehouse.location || '-'}</td>
                      <td>{warehouse.priority}</td>
                      <td>
                        <button className="btn-outline" style={{ padding: "3px 8px", fontSize: "11px" }} onClick={() => editWarehouse(warehouse)}>
                          Edit
                        </button>
                        <button className="btn-outline" style={{ padding: "3px 8px", fontSize: "11px", marginLeft: "6px" }} onClick={() => archiveWarehouse(warehouse)}>
                          Archive
                        </button>
                        <button className="btn-outline" style={{ padding: "3px 8px", fontSize: "11px", marginLeft: "6px", color: "#dc2626", borderColor: "#fca5a5" }} onClick={() => deleteWarehouse(warehouse)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <h2 style={{ fontSize: "16px", color: "#2b6cb0", marginTop: "32px", marginBottom: "16px", fontWeight: "600" }}>
          Orders Awaiting Physical Fulfillment ({ordersAwaiting.length})
        </h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Salesperson</th>
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
                  <td>{order.salesperson || 'Unassigned'}</td>
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
