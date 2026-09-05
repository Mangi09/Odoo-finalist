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
        <h1>Product catalog</h1>
        <p className="subtitle">Every product, variant and price list in one place.</p>

        {/* Action Header Buttons */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "22px" }}>
          <button
            style={{
              height: "40px",
              padding: "0 20px",
              borderRadius: "10px",
              border: "1px solid #1976bd",
              background: "#1976bd",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
            }}
            onClick={() => onNavigate && onNavigate("product-detail", { isNew: true })}
          >
            + New Product
          </button>

          <button
            style={{
              height: "40px",
              padding: "0 20px",
              borderRadius: "10px",
              border: "1px solid #777",
              background: "#ffffff",
              color: "#1976bd",
              fontSize: "12px",
              cursor: "pointer",
            }}
            onClick={() => onNavigate && onNavigate("discount-rules")}
          >
            Manage Price Rules
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#f8f9fa",
              border: "1px solid #c5c5c5",
              borderRadius: "12px",
              padding: "16px 20px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#222", marginBottom: "6px" }}>
              Total Products
            </div>
            <div style={{ fontSize: "12px", color: "#555" }}>{totalActive} active, 0 archived</div>
          </div>

          <div
            style={{
              background: "#f8f9fa",
              border: "1px solid #c5c5c5",
              borderRadius: "12px",
              padding: "16px 20px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#222", marginBottom: "6px" }}>
              Pricelists
            </div>
            <div style={{ fontSize: "12px", color: "#555" }}>3 tiers (Bronze, Silver, Gold), 2 Currencies</div>
          </div>

          <div
            style={{
              background: "#f8f9fa",
              border: "1px solid #c5c5c5",
              borderRadius: "12px",
              padding: "16px 20px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#222", marginBottom: "6px" }}>
              Variants
            </div>
            <div style={{ fontSize: "12px", color: "#555" }}>340 SKUs across all products</div>
          </div>
        </div>

        {/* Section Sub-Header Badge */}
        <div style={{ marginBottom: "12px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 16px",
              borderRadius: "8px",
              border: "1px solid #1976bd",
              color: "#1976bd",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            Products
          </span>
        </div>

        {/* Products Table */}
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
                  <td style={{ fontWeight: "500" }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.variants}</td>
                  <td>{p.price}</td>
                  <td>{p.unit}</td>
                  <td>{p.tax}</td>
                  <td style={{ color: "#299b45", fontWeight: "500" }}>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Information Banner Box */}
        <div className="info-box" style={{ marginTop: "20px" }}>
          Click a product row to open general info, variants and tier/currency price lists.
        </div>

        {/* Filter Section */}
        <div className="filter-section" style={{ marginTop: "18px" }}>
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
      </main>
  );
}

export default Products;
