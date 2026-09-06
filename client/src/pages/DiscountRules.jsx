import React, { useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";

const defaultTierRules = [
  { id: "T-01", tier: "Bronze", maxDiscount: 5 },
  { id: "T-02", tier: "Silver", maxDiscount: 10 },
  { id: "T-03", tier: "Gold", maxDiscount: 15 },
];

const defaultCategoryRules = [
  { id: "C-01", category: "Hardware", maxDiscount: 15 },
  { id: "C-02", category: "Services", maxDiscount: 10 },
  { id: "C-03", category: "Subscription", maxDiscount: 12 },
  { id: "C-04", category: "Software", maxDiscount: 20 },
];

const approvalMappings = [
  { id: "A-01", range: "Within tier/Category limit", requiredApproval: "No approval needed", badge: "approved" },
  { id: "A-02", range: "Over Limit, blended risk medium", requiredApproval: "Sales manager", badge: "pending" },
  { id: "A-03", range: "Over limit, blended high risk", requiredApproval: "Sales manager then finance", badge: "returned" },
];

function DiscountRules({ onNavigate }) {
  const [tierRules, setTierRules] = useState(defaultTierRules);
  const [categoryRules, setCategoryRules] = useState(defaultCategoryRules);
  const [notification, setNotification] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await api.discountRules.getAll();
      if (data?.tiers && data.tiers.length > 0) {
        setTierRules(data.tiers.map(t => ({
          id: t._id,
          tier: t.name,
          maxDiscount: t.maxDiscountPercent
        })));
      }
      if (data?.categories && data.categories.length > 0) {
        setCategoryRules(data.categories.map(c => ({
          id: c._id,
          category: c.name,
          maxDiscount: c.maxDiscount
        })));
      }
    } catch (err) {
      console.warn("Failed to load discount rules from DB, using defaults:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = (id, val) => {
    setTierRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, maxDiscount: val } : r))
    );
  };

  const handleCategoryChange = (id, val) => {
    setCategoryRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, maxDiscount: val } : r))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};

    tierRules.forEach((r) => {
      const num = parseFloat(r.maxDiscount);
      if (isNaN(num) || num < 0 || num > 100) {
        newErrors[`tier-${r.id}`] = "Must be between 0 and 100%";
      }
    });

    categoryRules.forEach((r) => {
      const num = parseFloat(r.maxDiscount);
      if (isNaN(num) || num < 0 || num > 100) {
        newErrors[`cat-${r.id}`] = "Must be between 0 and 100%";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await api.discountRules.updateBulk({
        tiers: tierRules.map(t => ({ id: t.id, maxDiscount: Number(t.maxDiscount) })),
        categories: categoryRules.map(c => ({ id: c.id, maxDiscount: Number(c.maxDiscount) })),
      });
      setNotification("Discount rules and approval chains configuration saved successfully to database!");
    } catch (err) {
      setNotification(`Error saving rules: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <h1>Discount tiers and approval chains</h1>

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
        </div>

        <p className="subtitle" style={{ marginBottom: "20px" }}>
          Configure customer-tier ceilings, category limits, and blended risk escalation thresholds
        </p>

        {notification && (
          <div className="info-box" style={{ marginBottom: "16px" }}>
            {notification}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Top Row Grid: Tier & Category Ceilings */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "24px",
            }}
          >
            {/* Card 1: Tier Discount Ceilings */}
            <div
              style={{
                border: "1px solid #c5c5c5",
                borderRadius: "15px",
                padding: "18px 22px",
                background: "#ffffff",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "12px" }}>
                Tier Discount Ceilings
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Tier</th>
                      <th>Max Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tierRules.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: "500" }}>{item.tier}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.maxDiscount}
                              onChange={(e) => handleTierChange(item.id, e.target.value)}
                              style={{
                                width: "90px",
                                height: "34px",
                                border: errors[`tier-${item.id}`] ? "1px solid #e82d32" : "1px solid #555",
                                borderRadius: "6px",
                                padding: "0 8px",
                                fontSize: "12px",
                              }}
                            />
                            <span>%</span>
                          </div>
                          {errors[`tier-${item.id}`] && (
                            <span style={{ fontSize: "11px", color: "#e82d32" }}>{errors[`tier-${item.id}`]}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card 2: Category Discount Ceilings */}
            <div
              style={{
                border: "1px solid #c5c5c5",
                borderRadius: "15px",
                padding: "18px 22px",
                background: "#ffffff",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "12px" }}>
                Category Discount ceilings
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Max Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryRules.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: "500" }}>{item.category}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.maxDiscount}
                              onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                              style={{
                                width: "90px",
                                height: "34px",
                                border: errors[`cat-${item.id}`] ? "1px solid #e82d32" : "1px solid #555",
                                borderRadius: "6px",
                                padding: "0 8px",
                                fontSize: "12px",
                              }}
                            />
                            <span>%</span>
                          </div>
                          {errors[`cat-${item.id}`] && (
                            <span style={{ fontSize: "11px", color: "#e82d32" }}>{errors[`cat-${item.id}`]}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Middle Row Card: Discount Range / Approval Mapping */}
          <div
            style={{
              border: "1px solid #c5c5c5",
              borderRadius: "15px",
              padding: "18px 22px",
              background: "#ffffff",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "12px" }}>
              Discount Approval Mapping
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Discount range</th>
                    <th>Required Approval Level</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalMappings.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: "500" }}>{item.range}</td>
                      <td>
                        <span
                          style={{
                            color:
                              item.badge === "approved"
                                ? "#299b45"
                                : item.badge === "pending"
                                ? "#f49a00"
                                : "#e82d32",
                            fontWeight: "500",
                          }}
                        >
                          {item.requiredApproval}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Configuration Button */}
          <div style={{ marginBottom: "20px" }}>
            <button
              type="submit"
              disabled={saving || loading}
              style={{
                height: "40px",
                padding: "0 24px",
                borderRadius: "10px",
                border: "1px solid #1976bd",
                background: "#1976bd",
                color: "#ffffff",
                fontSize: "12px",
                cursor: (saving || loading) ? "not-allowed" : "pointer",
                fontWeight: "500",
                opacity: (saving || loading) ? 0.7 : 1,
              }}
            >
              {saving ? "Saving to Database..." : "Save configuration"}
            </button>
          </div>
        </form>

        {/* Information Banner Box */}
        <div className="info-box">
          When a quote mixes categories with different ceilings, the system must compute a blended risk score and route to the highest required level. All approvals, rejections, and edits must be logged with user, timestamp, and reason.
        </div>
      </main>
  );
}

export default DiscountRules;
