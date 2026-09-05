import React from "react";
import "../App.css";

export default function FulfillmentList({ onNavigate }) {
  const warehouseStock = [
    { warehouse: "Main Warehouse", product: "Laptop Pro 14", inStock: 40, reserved: 18, available: 22 },
    { warehouse: "East Depot", product: "Laptop Pro 14", inStock: 10, reserved: 6, available: 4 },
    { warehouse: "Main Warehouse", product: "Docking Station", inStock: 65, reserved: 12, available: 53 },
  ];

  const ordersAwaiting = [
    { order: "Q-1042", customer: "Acme Corp", status: "Split Pending", warehouses: "Main + East Depot" },
    { order: "Q-1030", customer: "Zenith Co", status: "Backorder", warehouses: "East Depot" },
  ];

  return (
    <main className="content">
      <h1>Fulfillment and Stock (List)</h1>
      <p className="subtitle">
        Live stock per warehouse, plus every order that still needs fulfilling
      </p>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>Product</th>
              <th>In Stock</th>
              <th>Reserved</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {warehouseStock.map((item, idx) => (
              <tr key={idx}>
                <td>{item.warehouse}</td>
                <td>{item.product}</td>
                <td>{item.inStock}</td>
                <td>{item.reserved}</td>
                <td>{item.available}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: "16px", color: "#2b6cb0", marginTop: "32px", marginBottom: "16px", fontWeight: "600" }}>
        Orders Awaiting Fulfillment
      </h2>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Warehouses</th>
            </tr>
          </thead>
          <tbody>
            {ordersAwaiting.map((order, idx) => (
              <tr key={idx} onClick={() => onNavigate && onNavigate("fulfillment-detail", order)}>
                <td>{order.order}</td>
                <td>{order.customer}</td>
                <td>{order.status}</td>
                <td>{order.warehouses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-box" style={{ background: "#fefcbf", color: "#744210", borderLeftColor: "#ecc94b" }}>
        Click an order row to open its warehouse split detail.
      </div>
    </main>
  );
}
