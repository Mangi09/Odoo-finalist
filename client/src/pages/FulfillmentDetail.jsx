import React, { useState } from "react";
import "../App.css";
import { CheckCircle2, Edit3, ArrowLeft } from "lucide-react";

export default function FulfillmentDetail({ data, onNavigate }) {
  const orderTitle = data ? `${data.order || 'Q-1042'} (${data.customer || 'Acme Corp'})` : "Q-1042 (Acme Corp)";

  const [splitData, setSplitData] = useState([
    { warehouse: "Main Warehouse", qty: 18, shipments: 1, cost: 42 },
    { warehouse: "East Depot", qty: 6, shipments: 1, cost: 29 },
  ]);

  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleQtyChange = (idx, newQty) => {
    const val = parseInt(newQty, 10) || 0;
    setSplitData(prev => prev.map((item, i) => i === idx ? { ...item, qty: val, cost: Math.round(val * 2.1) } : item));
  };

  const handleWarehouseChange = (idx, newWarehouse) => {
    setSplitData(prev => prev.map((item, i) => i === idx ? { ...item, warehouse: newWarehouse } : item));
  };

  const handleSaveOverride = () => {
    setIsOverrideMode(false);
    setNotification("Custom warehouse split allocation saved successfully!");
  };

  return (
    <main className="content">
      <div className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span className="ops-label">Fulfillment Routing</span>
            <h1 style={{ margin: '4px 0' }}>Fulfillment Detail: {orderTitle}</h1>
            <p className="subtitle">
              Multi-warehouse inventory allocation, split-shipment optimization, and logistics dispatch.
            </p>
          </div>
          <button className="btn-outline" onClick={() => onNavigate && onNavigate("fulfillment-list")} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Back to Fulfillment
          </button>
        </div>

        {notification && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            background: "#f0fdf4",
            border: "1px solid #86efac",
            color: "#166534",
            fontWeight: 500,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <CheckCircle2 size={18} />
            {notification}
          </div>
        )}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Warehouse Depot</th>
                <th>Units Allocated</th>
                <th>Est. Shipments</th>
                <th>Logistics Cost</th>
              </tr>
            </thead>
            <tbody>
              {splitData.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    {isOverrideMode ? (
                      <select
                        value={item.warehouse}
                        onChange={(e) => handleWarehouseChange(idx, e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e0" }}
                      >
                        <option value="Main Warehouse">Main Warehouse</option>
                        <option value="East Depot">East Depot</option>
                        <option value="West Hub">West Hub</option>
                        <option value="Central Fulfillment">Central Fulfillment</option>
                      </select>
                    ) : (
                      <strong>{item.warehouse}</strong>
                    )}
                  </td>
                  <td>
                    {isOverrideMode ? (
                      <input
                        type="number"
                        min="0"
                        value={item.qty}
                        onChange={(e) => handleQtyChange(idx, e.target.value)}
                        style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e0" }}
                      />
                    ) : (
                      `${item.qty} units`
                    )}
                  </td>
                  <td>{item.shipments}</td>
                  <td>₹{item.cost * 80}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box" style={{ background: "#fefcbf", color: "#744210", borderLeftColor: "#ecc94b", marginBottom: "24px", marginTop: "20px" }}>
          "Consolidate Remaining Backorder" prompt appears automatically once East Depot restocks.
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          {isOverrideMode ? (
            <>
              <button className="btn-primary" onClick={handleSaveOverride}>
                Save Split Override
              </button>
              <button className="btn-outline" onClick={() => setIsOverrideMode(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => onNavigate && onNavigate("orders", { order: data?.order || "Q-1042", customer: data?.customer || "Acme Corp" })}>
                Accept Suggested Split
              </button>
              <button className="btn-outline" onClick={() => setIsOverrideMode(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Edit3 size={15} />
                <span>Manual Override</span>
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
