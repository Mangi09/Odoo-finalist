import React from "react";
import "../App.css";

const orders = [
  { id: "SO-1042", customer: "Acme Corp", source: "Q-1042", status: "Fulfillment Pending", invoice: "INV-1042" },
  { id: "SO-1041", customer: "Acme Corp", source: "Q-1041", status: "Partial", invoice: "INV-1043" },
  { id: "SO-1038", customer: "Nova Retail", source: "Q-1038", status: "Delivered", invoice: "INV-1038" },
];

export default function SalesOrders({ onNavigate }) {
  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header">
          <div className="page-header-left">
            <span className="ops-label">Sales Orders</span>
            <h1>Sales / Order List</h1>
            <p className="subtitle">Confirmed quotations that now drive fulfillment, subscriptions and invoices.</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Source Quote</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} onClick={() => onNavigate && onNavigate("fulfillment-list", { order: order.source, customer: order.customer, status: "Split Pending", warehouses: "Main + East Depot" })}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.source}</td>
                  <td><span className={`badge ${order.status === "Delivered" ? "green" : "amber"}`}>{order.status}</span></td>
                  <td>{order.invoice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box">Confirmed customer quotes create an order, reserve stock, create subscriptions for recurring lines, and generate invoice records.</div>

        <div className="button-row" style={{ marginTop: "20px" }}>
          <button className="btn-primary" onClick={() => onNavigate && onNavigate("subscriptions")}>View Subscriptions</button>
          <button className="btn-outline" onClick={() => onNavigate && onNavigate("invoices")}>View Invoices</button>
        </div>
      </div>
    </main>
  );
}
