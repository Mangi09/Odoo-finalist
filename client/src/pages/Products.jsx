import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { RefreshCw } from "lucide-react";

const initialProducts = [
  { id: "PROD-001", name: "Laptop Pro 14", category: "Hardware", variants: "3 (size)", price: "₹1,20,000", unit: "Each", tax: "18%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-002", name: "Onsite Setup Service", category: "Services", variants: "-", price: "₹45,000", unit: "Each", tax: "18%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-003", name: "Docking Station", category: "Hardware", variants: "3 (color)", price: "₹18,000", unit: "Each", tax: "18%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-004", name: "Care Plan 3 years", category: "Subscription", variants: "-", price: "₹4,000/mo", unit: "Recurring", tax: "18%", status: "Active", billingType: "RECURRING" },
  { id: "PROD-005", name: "NovaBook Ultra 16", category: "Hardware", variants: "2 (RAM)", price: "₹1,85,000", unit: "Each", tax: "18%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-006", name: "NovaMonitor 27", category: "Hardware", variants: "2 (color)", price: "₹32,000", unit: "Each", tax: "18%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-007", name: "NovaCloud Pro", category: "Cloud", variants: "-", price: "₹29,900/mo", unit: "Recurring", tax: "18%", status: "Active", billingType: "RECURRING" },
  { id: "PROD-008", name: "SecureDesk Enterprise", category: "Software", variants: "3 (tier)", price: "₹15,000/yr", unit: "Recurring", tax: "18%", status: "Active", billingType: "RECURRING" },
  { id: "PROD-009", name: "Extended Warranty 2yr", category: "Services", variants: "-", price: "₹9,900", unit: "Each", tax: "18%", status: "Active", billingType: "ONE_TIME" },
  { id: "PROD-010", name: "Premium Support SLA", category: "Subscription", variants: "-", price: "₹50,000/mo", unit: "Recurring", tax: "18%", status: "Active", billingType: "RECURRING" },
];

function Products({ onNavigate, onSelectProduct }) {
  const [products, setProducts] = useState(initialProducts);
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.products.getAll();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((p, idx) => ({
          _id: p._id,
          id: p.sku || `PROD-${String(idx + 1).padStart(3, '0')}`,
          name: p.name,
          category: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase() : "Hardware",
          variants: p.variants?.length ? `${p.variants.length} options` : "-",
          price: p.basePrice ? `₹${p.basePrice.toLocaleString('en-IN')}` : "₹1,200",
          unit: p.billingType === 'RECURRING' ? "Recurring" : "Each",
          tax: `${p.taxRate || 18}%`,
          status: p.isActive !== false ? "Active" : "Archived",
          billingType: p.billingType || "ONE_TIME",
          rawProduct: p
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.warn("Products API fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalActive = products.filter((p) => p.status === "Active").length;

  const filteredProducts = products.filter((p) => {
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

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="page-header-left">
            <span className="ops-label">Product Master</span>
            <h1>Product Catalog</h1>
            <p className="subtitle">Every SKU, variant specification and tiered pricelist in one centralized inventory.</p>
          </div>
          <button className="btn-outline" onClick={loadProducts} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
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
            <div className="metric-sub">Active catalog SKUs</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Pricelists</div>
            <div className="metric-value">3 tiers</div>
            <div className="metric-sub">Bronze, Silver, Gold (INR / USD)</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Variants & Options</div>
            <div className="metric-value">340</div>
            <div className="metric-sub">Configurable attributes across all lines</div>
          </div>
        </div>
      </div>

      <div className="page-card">
        <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div className="section-title-small">
            <span className="badge purple">Live Product SKUs ({filteredProducts.length})</span>
          </div>

          <div className="filter-section" style={{ margin: 0 }}>
            <label htmlFor="filter" style={{ marginRight: "8px", fontSize: "13px" }}>Filter Category:</label>
            <select
              id="filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e0" }}
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

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Variants</th>
                <th>Price</th>
                <th>Billing Model</th>
                <th>Tax</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id || p.id} onClick={() => handleRowClick(p)} style={{ cursor: "pointer" }}>
                  <td className="text-medium" style={{ fontWeight: 600, color: "#1a365d" }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.variants}</td>
                  <td style={{ fontWeight: 600 }}>{p.price}</td>
                  <td>{p.unit}</td>
                  <td>{p.tax}</td>
                  <td><span className="badge green">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box" style={{ marginTop: "16px" }}>
          Click any product row to inspect SKU specifications, multi-tier pricing, and customer discount rules.
        </div>
      </div>
    </main>
  );
}

export default Products;
