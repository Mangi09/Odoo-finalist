import React, { useState } from "react";
import "../App.css";

const initialProducts = [
  { id: "PROD-001", name: "Laptop Pro 14", category: "Hardware", variants: "3 (size)", price: "$1,200", unit: "Each", tax: "15%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-002", name: "Onsite Setup Service", category: "Services", variants: "-", price: "$450", unit: "Each", tax: "10%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-003", name: "Docking Station", category: "Hardware", variants: "3 (color)", price: "$180", unit: "Each", tax: "15%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-004", name: "Care Plan 3 years", category: "Subscription", variants: "-", price: "$40/month", unit: "Recurring", tax: "0%", status: "Active", billingType: "RECURRING" },
  { id: "PROD-005", name: "NovaBook Ultra 16", category: "Hardware", variants: "2 (RAM)", price: "$1,850", unit: "Each", tax: "15%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-006", name: "NovaMonitor 27", category: "Hardware", variants: "2 (color)", price: "$320", unit: "Each", tax: "15%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-007", name: "NovaCloud Pro", category: "Cloud", variants: "-", price: "$299/month", unit: "Recurring", tax: "0%", status: "Active", billingType: "RECURRING" },
  { id: "PROD-008", name: "SecureDesk Enterprise", category: "Software", variants: "3 (tier)", price: "$150/year", unit: "Recurring", tax: "5%", status: "Active", billingType: "RECURRING" },
  { id: "PROD-009", name: "Extended Warranty 2yr", category: "Services", variants: "-", price: "$99", unit: "Each", tax: "0%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-010", name: "Premium Support SLA", category: "Subscription", variants: "-", price: "$500/month", unit: "Recurring", tax: "0%", status: "Active", billingType: "RECURRING" },
];

function Products({ onNavigate, onSelectProduct }) {
  const [filterCategory, setFilterCategory] = useState("all");

  const totalActive = initialProducts.filter((p) => p.status === "Active").length;

  const filteredProducts = initialProducts.filter((p) => {
    if (filterCategory === "all") return true;
    return p.category.toLowerCase() === filterCategory.toLowerCase();
  });

  const handleRowClick = (product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    if (onNavigate) {
      onNavigate("product-detail", product);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "quotations", label: "Quotations" },
    { id: "approvals", label: "Approvals" },
    { id: "fulfillment", label: "Fulfillment" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "invoices", label: "Invoices" },
    { id: "deal-health", label: "Deal Health" },
    { id: "reports", label: "Reports" },
    { id: "products", label: "Products" },
    { id: "customer-portal", label: "Customer Portal" },
  ];

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Product catalog</h1>
            <p className="subtitle">Every product, variant and price list in one place.</p>
          </div>
        </div>

        <div className="button-row page-actions">
          <button
            className="btn-primary"
            onClick={() => onNavigate && onNavigate("product-detail", { isNew: true })}
          >
            + New Product
          </button>

          <button
            className="btn-secondary"
            onClick={() => onNavigate && onNavigate("discount-rules")}
          >
            Manage Price Rules
          </button>
        </div>

        <div className="metrics-container">
          <div className="metric-card">
            <div className="metric-label">Total Products</div>
            <div className="metric-value">{totalActive}</div>
            <div className="metric-sub">active, 0 archived</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Pricelists</div>
            <div className="metric-value">3 tiers</div>
            <div className="metric-sub">Bronze, Silver, Gold, 2 Currencies</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Variants</div>
            <div className="metric-value">340</div>
            <div className="metric-sub">SKUs across all products</div>
          </div>
        </div>
      </div>

      <div className="page-card">
        <div className="section-header">
          <div className="section-title-small">
            <span className="badge purple">Products</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product name</th>
                <th>Category</th>
                <th>Variants</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Tax</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} onClick={() => handleRowClick(p)}>
                  <td className="text-medium">{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.variants}</td>
                  <td>{p.price}</td>
                  <td>{p.unit}</td>
                  <td>{p.tax}</td>
                  <td><span className="badge green">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box">
          Click a product row to open general info, variants and tier/currency price lists.
        </div>

        <div className="filter-section">
          <label htmlFor="filter">Filter Category:</label>
          <select
            id="filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="hardware">Hardware</option>
            <option value="services">Services</option>
            <option value="subscription">Subscription</option>
            <option value="cloud">Cloud</option>
            <option value="software">Software</option>
          </select>
        </div>
      </div>
      </main>
  );
}

export default Products;
