import React from "react";
import "../App.css";

export default function FulfillmentDetail({ data }) {
  const orderTitle = data ? `${data.order} (${data.customer})` : "Q-1042 (Acme Corp)";

  const splitData = [
    { warehouse: "Main Warehouse", qty: "18 units", shipments: 1, cost: "$42" },
    { warehouse: "East Depot", qty: "6 units", shipments: 1, cost: "$29" },
  ];

  return (
    <main className="content">
      <h1>Fulfillment Detail: {orderTitle}</h1>
      <p className="subtitle">
        Opened by clicking an order row on the Fulfillment list
      </p>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>Qty Fulfilled</th>
              <th>Est. Shipments</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {splitData.map((item, idx) => (
              <tr key={idx}>
                <td>{item.warehouse}</td>
                <td>{item.qty}</td>
                <td>{item.shipments}</td>
                <td>{item.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-box" style={{ background: "#fefcbf", color: "#744210", borderLeftColor: "#ecc94b", marginBottom: "24px" }}>
        "Consolidate Remaining Backorder" prompt appears automatically once East Depot restocks.
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        <button
          style={{
            height: "40px",
            padding: "0 24px",
            borderRadius: "6px",
            background: "#2b6cb0",
            color: "white",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Accept Suggested Split
        </button>
        <button
          style={{
            height: "40px",
            padding: "0 24px",
            borderRadius: "6px",
            background: "white",
            color: "#4a5568",
            border: "1px solid #cbd5e0",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Manual Override
        </button>
      </div>
    </main>
  );
}
