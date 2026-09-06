import React, { useState, useEffect } from "react";
import "../App.css";

function ProductDetail({ product, onNavigate, onSaveProduct, currentUser }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Hardware",
    price: "",
    unit: "Each",
    description: "",
    tax: "15%",
    isSubscription: "NO",
    recurringCycle: "Monthly",
    qtyOnHand: "24",
  });

  const [notification, setNotification] = useState("");
  const [errors, setErrors] = useState({});
  const canEditProduct = ['sales_manager', 'admin'].includes(currentUser?.role);
  const canManagePriceRules = currentUser?.role === 'admin';

  useEffect(() => {
    if (product && !product.isNew) {
      const isSub = product.billingType === "RECURRING" || product.unit === "Recurring" ? "Yes" : "NO";
      setFormData({
        name: product.name || "",
        category: product.category || "Hardware",
        price: product.price ? product.price.replace(/[^0-9.]/g, "") : "",
        unit: product.unit || "Each",
        description: product.description || `${product.name} enterprise specification`,
        tax: product.tax || "15%",
        isSubscription: isSub,
        recurringCycle: product.recurringCycle || "Monthly",
        qtyOnHand: product.qtyOnHand || "24",
      });
    }
  }, [product]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canEditProduct) {
      setNotification("Product catalog is read-only for salesperson users.");
      return;
    }
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required.";
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      newErrors.price = "Valid numeric price is required.";
    }
    if (isNaN(parseInt(formData.qtyOnHand))) {
      newErrors.qtyOnHand = "Quantity on hand must be an integer.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const savedProduct = {
      id: product?.id || `PROD-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      category: formData.category,
      variants: product?.variants || "Standard",
      price: formData.isSubscription === "Yes" ? `₹${formData.price}/month` : `₹${formData.price}`,
      unit: formData.isSubscription === "Yes" ? "Recurring" : formData.unit,
      tax: formData.tax.includes("%") ? formData.tax : `${formData.tax}%`,
      status: "Active",
      billingType: formData.isSubscription === "Yes" ? "RECURRING" : "ONE_TIME",
      recurringCycle: formData.isSubscription === "Yes" ? formData.recurringCycle : null,
      qtyOnHand: formData.qtyOnHand,
      description: formData.description,
    };

    if (onSaveProduct) {
      onSaveProduct(savedProduct);
    }

    setNotification(`Product "${formData.name}" saved successfully!`);
    setTimeout(() => {
      if (onNavigate) onNavigate("product");
    }, 800);
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
    { id: "product", label: "Products" },
    { id: "customer-portal", label: "Customer Portal" },
  ];

  return (
    <div className="app">
      {/* Header Navigation */}
      <nav className="navbar">
        <div className="logo">DealFlow360</div>

        <div className="nav-links">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={item.id === "product" ? "active" : ""}
              onClick={() => onNavigate && onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h1>Product and pricelist</h1>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={{
                height: "36px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid #1976bd",
                background: "#ffffff",
                color: "#1976bd",
                fontSize: "12px",
                cursor: "pointer",
              }}
              onClick={() => onNavigate && onNavigate("product")}
            >
              &larr; Back to Products
            </button>

            {canManagePriceRules && (
              <button
                style={{
                  height: "36px",
                  padding: "0 14px",
                  borderRadius: "8px",
                  border: "1px solid #777",
                  background: "#ffffff",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
                onClick={() => onNavigate && onNavigate("discount-rules")}
              >
                Manage Price Rules
              </button>
            )}
          </div>
        </div>

        {notification && (
          <div className="info-box" style={{ marginBottom: "14px" }}>
            {notification}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset disabled={!canEditProduct} style={{ border: 0, padding: 0, margin: 0 }}>
          {/* General Info Section Card */}
          <div
            style={{
              border: "1px solid #90caf9",
              borderRadius: "15px",
              padding: "20px 24px",
              background: "#fdfefe",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#555", marginBottom: "16px" }}>
              General Info
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Left Column */}
              <div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "4px" }}>
                    Product name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Laptop Pro 14"
                    style={{
                      width: "100%",
                      height: "38px",
                      border: errors.name ? "1px solid #e82d32" : "1px solid #555",
                      borderRadius: "9px",
                      padding: "0 12px",
                      fontSize: "12px",
                    }}
                  />
                  {errors.name && <span style={{ fontSize: "11px", color: "#e82d32" }}>{errors.name}</span>}
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "4px" }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      border: "1px solid #555",
                      borderRadius: "9px",
                      padding: "0 12px",
                      fontSize: "12px",
                    }}
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Services">Services</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Software">Software</option>
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "4px" }}>
                    Price (₹)
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="e.g. 1200"
                    style={{
                      width: "100%",
                      height: "38px",
                      border: errors.price ? "1px solid #e82d32" : "1px solid #555",
                      borderRadius: "9px",
                      padding: "0 12px",
                      fontSize: "12px",
                    }}
                  />
                  {errors.price && <span style={{ fontSize: "11px", color: "#e82d32" }}>{errors.price}</span>}
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "4px" }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => handleChange("unit", e.target.value)}
                    placeholder="e.g. Each / Monthly"
                    style={{
                      width: "100%",
                      height: "38px",
                      border: "1px solid #555",
                      borderRadius: "9px",
                      padding: "0 12px",
                      fontSize: "12px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "4px" }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Product specification or description..."
                    style={{
                      width: "100%",
                      border: "1px solid #555",
                      borderRadius: "9px",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "4px" }}>
                    Tax %
                  </label>
                  <input
                    type="text"
                    value={formData.tax}
                    onChange={(e) => handleChange("tax", e.target.value)}
                    placeholder="e.g. 15%"
                    style={{
                      width: "100%",
                      height: "38px",
                      border: "1px solid #555",
                      borderRadius: "9px",
                      padding: "0 12px",
                      fontSize: "12px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "4px" }}>
                    Subscription
                  </label>
                  <select
                    value={formData.isSubscription}
                    onChange={(e) => handleChange("isSubscription", e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      border: "1px solid #555",
                      borderRadius: "9px",
                      padding: "0 12px",
                      fontSize: "12px",
                    }}
                  >
                    <option value="NO">NO</option>
                    <option value="Yes">Yes</option>
                  </select>
                  <span style={{ fontSize: "11px", color: "#777", marginTop: "2px", display: "block" }}>
                    If subscription yes then recurring will be visible
                  </span>
                </div>

                {formData.isSubscription === "Yes" && (
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "4px" }}>
                      Recurring Cycle
                    </label>
                    <select
                      value={formData.recurringCycle}
                      onChange={(e) => handleChange("recurringCycle", e.target.value)}
                      style={{
                        width: "100%",
                        height: "38px",
                        border: "1px solid #555",
                        borderRadius: "9px",
                        padding: "0 12px",
                        fontSize: "12px",
                      }}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "4px" }}>
                    Quantity on hand
                  </label>
                  <input
                    type="number"
                    value={formData.qtyOnHand}
                    onChange={(e) => handleChange("qtyOnHand", e.target.value)}
                    placeholder="e.g. 24"
                    style={{
                      width: "100%",
                      height: "38px",
                      border: errors.qtyOnHand ? "1px solid #e82d32" : "1px solid #555",
                      borderRadius: "9px",
                      padding: "0 12px",
                      fontSize: "12px",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#777" }}>(Integer field)</span>
                  {errors.qtyOnHand && <span style={{ fontSize: "11px", color: "#e82d32", display: "block" }}>{errors.qtyOnHand}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Product Variants Section */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "13px", color: "#777", marginBottom: "8px", fontWeight: "500" }}>
              Product Variants
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th>Values</th>
                    <th>Extra price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Color</td>
                    <td>Blue, Black</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>RAM</td>
                    <td>4GB, 8GB</td>
                    <td>+₹30</td>
                  </tr>
                  <tr>
                    <td>Manufacturer</td>
                    <td>Dell, HP</td>
                    <td>+₹10/+₹30</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          </fieldset>

          {/* Pricelists Section */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "13px", color: "#777", marginBottom: "8px", fontWeight: "500" }}>
              Pricelists
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Currency</th>
                    <th>Price Rule</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Bronze</td>
                    <td>INR</td>
                    <td>Price, no adjustment</td>
                  </tr>
                  <tr>
                    <td>Gold</td>
                    <td>INR</td>
                    <td>Price minus 10 percent base</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Action Buttons */}
          {canEditProduct && (
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <button
                type="submit"
                style={{
                  height: "40px",
                  padding: "0 24px",
                  borderRadius: "10px",
                  border: "1px solid #1976bd",
                  background: "#1976bd",
                  color: "#ffffff",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Save Product
              </button>
            </div>
          )}
        </form>

        {/* Information Banner Box */}
        <div className="info-box">
          {canEditProduct
            ? "Product details should be filled. Recurring order with this product will be invoiced at the beginning of the period."
            : "Product catalog is available as read-only for this role."}
        </div>
      </main>
    </div>
  );
}

export default ProductDetail;
