import React, { useMemo, useState, useEffect } from "react";
import "../App.css";
import { api } from "../services/api";
import { ArrowLeft, CheckCircle2, Send, ExternalLink, Save, Plus, AlertTriangle, UserPlus } from "lucide-react";

export default function QuotationDetailPage({ onNavigate, quote, currentUser }) {
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [lines, setLines] = useState([]);

  // New Line State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [globalDiscountPercent, setGlobalDiscountPercent] = useState(0);
  const [inventoryWarning, setInventoryWarning] = useState("");

  // New Customer State
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({ companyName: "", contactName: "", email: "", phone: "" });

  const quoteLookupId = quote?._id || quote?.id || null;
  const isNew = !quoteLookupId;
  const canEditQuotation = !quotation || ['DRAFT', 'PENDING_APPROVAL', 'RE_APPROVAL'].includes(quotation.status);
  const quoteSubtotal = useMemo(
    () => lines.reduce((sum, line) => {
      const unit = Number(line.price || 0);
      const quantity = Number(line.qty || 0);
      const discount = Number(line.discount || 0);
      return sum + Math.round(unit * quantity * (1 - discount / 100));
    }, 0),
    [lines]
  );
  const normalizedGlobalDiscount = Math.min(100, Math.max(0, Number(globalDiscountPercent || 0)));
  const globalDiscountAmount = Math.round(quoteSubtotal * (normalizedGlobalDiscount / 100));
  const quoteFinalTotal = Math.max(0, quoteSubtotal - globalDiscountAmount);

  useEffect(() => {
    loadData();
  }, [quote]);

  const loadData = async () => {
    setLoading(true);
    try {
      const prods = await api.products.getAll();
      setProducts(prods || []);

      const custs = await api.customers.getAll();
      setCustomers(custs || []);

      if (isNew) {
        setQuotation(null);
        setLines([]);
        setRecommendations([]);
        setGlobalDiscountPercent(0);
        if (custs && custs.length > 0) {
          setSelectedCustomerId(custs[0]._id);
        }
      } else {
        const qData = await api.quotations.getById(quoteLookupId);
        setQuotation(qData);
        setGlobalDiscountPercent(qData.globalDiscountPercent || 0);
        setSelectedCustomerId(qData.customer?._id || qData.customerId?._id || qData.customerId || "");

        if (qData.items && qData.items.length > 0) {
          const mappedLines = qData.items.map(item => ({
            product: item.product || item.productId?.name || "Unknown Product",
            productId: item.productId?._id || item.productId,
            qty: item.quantity || item.qty,
            price: item.unitPrice,
            discount: item.discountPercent,
            limit: item.productId?.maxDiscountAllowed || 10,
            status: item.discountPercent > (item.productId?.maxDiscountAllowed || 10) ? "OVER - High" : "OK"
          }));
          setLines(mappedLines);
        }
        const recs = await api.recommendations.getForQuotation(qData._id);
        setRecommendations(Array.isArray(recs) ? recs : []);
      }
    } catch (err) {
      console.warn("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const pid = e.target.value;
    setSelectedProductId(pid);
    const prod = products.find(p => p._id === pid);
    if (prod && qty > prod.stockQuantity) {
      setInventoryWarning(`Warning: Only ${prod.stockQuantity} in stock.`);
    } else {
      setInventoryWarning("");
    }
  };

  const handleQtyChange = (e) => {
    const val = parseInt(e.target.value) || 1;
    setQty(val);
    if (selectedProductId) {
      const prod = products.find(p => p._id === selectedProductId);
      if (prod && val > prod.stockQuantity) {
        setInventoryWarning(`Warning: Only ${prod.stockQuantity} in stock.`);
      } else {
        setInventoryWarning("");
      }
    }
  };

  const handlePercentChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === "") {
      setter("");
      return;
    }
    const numeric = Number(value);
    if (!Number.isNaN(numeric) && numeric >= 0 && numeric <= 100) {
      setter(value);
    }
  };

  const handleAddLine = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p._id === selectedProductId);
    if (!prod) return;

    const limit = prod.maxDiscountAllowed || 10;
    const lineDiscount = Math.min(100, Math.max(0, Number(discountPercent || 0)));
    const status = lineDiscount > limit ? "OVER - High" : "OK";

    setLines(prev => [...prev, {
      product: prod.name,
      productId: prod._id,
      qty,
      price: prod.basePrice || prod.sellingPrice || 0,
      discount: lineDiscount,
      limit,
      status
    }]);

    // reset
    setSelectedProductId("");
    setQty(1);
    setDiscountPercent(0);
    setInventoryWarning("");
  };

  const handleRemoveLine = (idx) => {
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerData.companyName || !newCustomerData.email || !newCustomerData.contactName) {
      setNotice("Error: Company Name, Contact Name, and Email are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const newCust = await api.customers.create(newCustomerData);
      setCustomers(prev => [...prev, newCust]);
      setSelectedCustomerId(newCust._id);
      setShowNewCustomerForm(false);
      setNewCustomerData({ companyName: "", contactName: "", email: "", phone: "" });
      setNotice(`Customer ${newCust.companyName} created successfully.`);
    } catch (err) {
      setNotice(`Error creating customer: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedCustomerId) {
      setNotice("Error: Please select a customer.");
      return;
    }
    if (Number(globalDiscountPercent || 0) !== normalizedGlobalDiscount) {
      setNotice("Error: Global discount must be between 0 and 100.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        items: lines.map(l => ({
          productId: l.productId,
          qty: l.qty,
          unitPrice: l.price,
          discountPercent: l.discount
        })),
        globalDiscountPercent: normalizedGlobalDiscount
      };

      if (!quotation) {
        const res = await api.quotations.create(payload);
        const warning = res.inventoryWarnings?.length ? ` Inventory warning: ${res.inventoryWarnings.map(w => `${w.requestedQty} requested / ${w.availableQty} available`).join('; ')}.` : '';
        setNotice(`Draft saved successfully! Quotation ID: ${res.quotationNumber || res._id}.${warning}`);
        if (res._id) {
          setQuotation(res);
          const recs = await api.recommendations.getForQuotation(res._id);
          setRecommendations(Array.isArray(recs) ? recs : []);
        }
      } else {
        const res = await api.quotations.update(quotation._id, payload);
        const warning = res.inventoryWarnings?.length ? ` Inventory warning: ${res.inventoryWarnings.map(w => `${w.requestedQty} requested / ${w.availableQty} available`).join('; ')}.` : '';
        setQuotation(res);
        const recs = await api.recommendations.getForQuotation(res._id || quotation._id);
        setRecommendations(Array.isArray(recs) ? recs : []);
        setNotice(`Quotation ${quotation.quotationNumber || quotation._id} updated successfully.${warning}`);
      }
    } catch (err) {
      setNotice(`Error saving: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitApproval = async () => {
    if (!quotation) {
      setNotice("Please save as draft first before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.quotations.submit(quotation._id);
      const needsApproval = result?.needsApproval;
      if (needsApproval) {
        setNotice(`Quotation ${quotation.quotationNumber || quotation._id} submitted for manager approval. (Discount exceeds policy limit.)`);
      } else {
        setNotice(`Quotation ${quotation.quotationNumber || quotation._id} auto-approved! Click "Send to Customer" to share it.`);
      }
      // Reload quotation so status updates and buttons refresh
      const updated = await api.quotations.getById(quotation._id);
      setQuotation(updated);
      setTimeout(() => {
        if (needsApproval && onNavigate) onNavigate("approvals");
      }, 2000);
    } catch (err) {
      setNotice(`Error submitting: ${err.message}`);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToCustomer = async () => {
    if (!quotation?._id) return;
    setIsSubmitting(true);
    try {
      await api.quotations.sendToCustomer(quotation._id);
      const updated = await api.quotations.getById(quotation._id);
      setQuotation(updated);
      setNotice(`Quotation sent to customer! They can now view, accept or negotiate it in their portal.`);
    } catch (err) {
      setNotice(`Error sending: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptQuotation = async () => {
    if (!quotation?._id || !window.confirm('Accept this quotation and create a Sales Order?')) return;
    setIsSubmitting(true);
    try {
      const result = await api.quotations.accept(quotation._id);
      const so = result?.salesOrder;
      setNotice(`Quotation accepted! Sales Order ${so?.orderNumber || ''} created. Redirecting...`);
      setTimeout(() => {
        if (onNavigate) onNavigate('orders', so || null);
      }, 1200);
    } catch (err) {
      setNotice(`Error accepting: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!quotation?._id || !window.confirm(`Archive quotation ${quoteId}?`)) return;
    setIsSubmitting(true);
    try {
      await api.quotations.archive(quotation._id);
      setNotice(`Quotation ${quoteId} archived successfully.`);
      setTimeout(() => onNavigate && onNavigate("quotations"), 800);
    } catch (err) {
      setNotice(`Error archiving: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!quotation?._id || !window.confirm(`Delete quotation ${quoteId}? This cannot be undone.`)) return;
    setIsSubmitting(true);
    try {
      await api.quotations.delete(quotation._id);
      setNotice(`Quotation ${quoteId} deleted successfully.`);
      setTimeout(() => onNavigate && onNavigate("quotations"), 800);
    } catch (err) {
      setNotice(`Error deleting: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quoteId = quotation?.quotationNumber || (quotation?._id ? `Q-${quotation._id.toString().slice(-4).toUpperCase()}` : quote?.id || "New Quotation");
  const selectedCustomer = customers.find(c => c._id === selectedCustomerId);
  const customerName = selectedCustomer?.name || selectedCustomer?.companyName || quotation?.customerId?.name || quotation?.customerId?.companyName || "Select Customer";
  const title = !quotation ? "Drafting New Quotation" : `${quoteId} (${customerName})`;

  return (
    <main className="content">
      <div className="page-card">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div className="page-header-left">
            <span className="ops-label">Quotation Configuration</span>
            <h1 style={{ margin: "4px 0" }}>Quotation Detail: {title}</h1>
            <p className="subtitle">Add products, configure line-item discounts, and evaluate real-time margin rules.</p>
          </div>
          <button className="btn-outline" onClick={() => onNavigate && onNavigate("quotations")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={16} /> Back to Quotations
          </button>
        </div>

        {notice && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            background: notice.includes('Error') ? '#fef2f2' : "#f0fdf4",
            border: `1px solid ${notice.includes('Error') ? '#fca5a5' : '#86efac'}`,
            color: notice.includes('Error') ? '#991b1b' : "#166534",
            fontWeight: 500,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <CheckCircle2 size={18} />
            {notice}
          </div>
        )}

        {!quotation && (
          <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <label style={{ fontWeight: 600, fontSize: "14px" }}>Customer:</label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e0", minWidth: "200px" }}
              >
                <option value="">-- Select Customer --</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.companyName || c.name}</option>)}
              </select>
              <button className="btn-outline" onClick={() => setShowNewCustomerForm(!showNewCustomerForm)} style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <UserPlus size={14} /> New Customer
              </button>
            </div>

            {showNewCustomerForm && (
              <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#4a5568" }}>Company Name</label>
                  <input type="text" value={newCustomerData.companyName} onChange={e => setNewCustomerData({...newCustomerData, companyName: e.target.value})} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#4a5568" }}>Contact Name</label>
                  <input type="text" value={newCustomerData.contactName} onChange={e => setNewCustomerData({...newCustomerData, contactName: e.target.value})} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#4a5568" }}>Email</label>
                  <input type="email" value={newCustomerData.email} onChange={e => setNewCustomerData({...newCustomerData, email: e.target.value})} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0" }} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button className="btn-secondary" onClick={handleCreateCustomer} disabled={isSubmitting} style={{ padding: "8px 16px", height: "37px" }}>Create</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Selection Form */}
        {canEditQuotation && (
          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "14px", margin: "0 0 12px 0", color: "#1a365d" }}>Add Line Item</h3>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#4a5568" }}>Product</label>
                <select
                  value={selectedProductId}
                  onChange={handleProductChange}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0" }}
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} - ₹{(p.basePrice || p.sellingPrice || 0).toLocaleString('en-IN')} (Max Disc: {p.maxDiscountAllowed}%)</option>
                  ))}
                </select>
              </div>

              <div style={{ width: "80px" }}>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#4a5568" }}>Qty</label>
                <input
                  type="number" min="1" value={qty} onChange={handleQtyChange}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0" }}
                />
              </div>

              <div style={{ width: "120px" }}>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#4a5568" }}>Discount %</label>
                <input
                  type="number" min="0" max="100" step="0.01" value={discountPercent} onChange={handlePercentChange(setDiscountPercent)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0" }}
                />
              </div>

              <button className="btn-secondary" onClick={handleAddLine} disabled={!selectedProductId} style={{ padding: "8px 16px", height: "37px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Plus size={16} /> Add
              </button>
            </div>
            {inventoryWarning && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#d97706", fontSize: "13px", marginTop: "8px", fontWeight: 500 }}>
                <AlertTriangle size={14} /> {inventoryWarning}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "14px", margin: "0 0 12px 0", color: "#1a365d" }}>Quotation Totals</h3>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ minWidth: "180px" }}>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#4a5568" }}>Global Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={globalDiscountPercent}
                onChange={handlePercentChange(setGlobalDiscountPercent)}
                disabled={!canEditQuotation}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e0" }}
              />
            </div>
            <div style={{ minWidth: "160px" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Subtotal</div>
              <strong>₹{quoteSubtotal.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ minWidth: "160px" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Global Discount</div>
              <strong>-₹{globalDiscountAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ minWidth: "160px" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Final Total</div>
              <strong>₹{quoteFinalTotal.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Line Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Line Total</th>
                <th>Limit Ceiling</th>
                <th>Validation Status</th>
                {canEditQuotation && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {lines.length > 0 ? lines.map((line, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: "#1a365d" }}>{line.product}</td>
                  <td>{line.qty}</td>
                  <td>₹{(line.price || 0).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 600 }}>{line.discount}%</td>
                  <td style={{ fontWeight: 600 }}>₹{Math.round(Number(line.price || 0) * Number(line.qty || 0) * (1 - Number(line.discount || 0) / 100)).toLocaleString('en-IN')}</td>
                  <td>{line.limit}%</td>
                  <td>
                    <span className={`badge ${line.status.includes("OVER") ? "red" : "green"}`}>
                      {line.status}
                    </span>
                  </td>
                  {canEditQuotation && (
                    <td>
                      <button className="btn-outline" style={{ padding: "2px 6px", fontSize: "11px", color: "#dc2626", borderColor: "#fca5a5" }} onClick={() => handleRemoveLine(idx)}>
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={canEditQuotation ? 8 : 7} style={{ textAlign: "center", padding: "20px", color: "#718096" }}>No line items added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {lines.some(l => l.status.includes("OVER")) && (
          <div className="info-box" style={{ marginTop: "18px", borderLeftColor: "#e53e3e", background: "#fff5f5", color: "#9b2c2c" }}>
            Automated rule engine: One or more lines exceed the discount ceiling, automatically requiring Manager approval before customer submission.
          </div>
        )}
      </div>

      <div className="page-card">
        <h2>Upsell & Cross-Sell AI Recommendations</h2>
        <div className="mini-card-grid">
          {recommendations.length > 0 ? recommendations.map((rec) => (
            <div className="mini-card" key={rec._id || rec.id}>
              <div className="mini-card-title">{rec.product}</div>
              <div className="mini-card-value">{rec.marginImpact}</div>
              <small style={{ color: "#64748b" }}>{rec.reason || rec.type}</small>
            </div>
          )) : (
            <div className="mini-card">
              <div className="mini-card-title">No recommendations yet</div>
              <div className="mini-card-value">Save quotation</div>
              <small style={{ color: "#64748b" }}>Recommendations are generated from saved quotation products.</small>
            </div>
          )}
        </div>

        <div className="button-row" style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {canEditQuotation && (
            <button className="btn-outline" onClick={handleSaveDraft} disabled={isSubmitting} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Save size={15} />
              <span>{isSubmitting && !quotation ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}

          {(!quotation || ['DRAFT', 'REJECTED'].includes(quotation?.status)) && (
            <button className="btn-primary" onClick={handleSubmitApproval} disabled={isSubmitting || lines.length === 0} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Send size={15} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit for Approval'}</span>
            </button>
          )}

          {/* APPROVED → Send to Customer */}
          {quotation && quotation.status === 'APPROVED' && (
            <button
              className="btn-primary"
              onClick={handleSendToCustomer}
              disabled={isSubmitting}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: '#0ea5e9', borderColor: '#0284c7' }}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Sending...' : 'Send to Customer'}</span>
            </button>
          )}

          {/* SENT_TO_CUSTOMER / NEGOTIATION / RE_APPROVAL → inform */}
          {quotation && ['SENT_TO_CUSTOMER', 'NEGOTIATION'].includes(quotation.status) && (
            <span style={{ fontSize: '13px', color: '#6b7280', alignSelf: 'center' }}>
              ✅ Sent — awaiting customer response
            </span>
          )}

          {/* ACCEPTED → Accept Quotation to create Sales Order */}
          {quotation && quotation.status === 'ACCEPTED' && (
            <button
              className="btn-primary"
              onClick={handleAcceptQuotation}
              disabled={isSubmitting}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: '#16a34a', borderColor: '#15803d' }}
            >
              <CheckCircle2 size={15} />
              <span>{isSubmitting ? 'Creating Order...' : 'Convert to Sales Order'}</span>
            </button>
          )}

          {quotation && quotation.status === 'ACCEPTED' && (
            <button
              className="btn-outline"
              onClick={() => onNavigate && onNavigate("customer-portal", { id: quoteId, customer: customerName, total: "...", status: "Negotiation" })}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <ExternalLink size={15} />
              <span>Open in Customer Portal</span>
            </button>
          )}

          {quotation && (
            <>
              <button className="btn-outline" onClick={handleArchive} disabled={isSubmitting} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                Archive
              </button>
              <button className="btn-outline" onClick={handleDelete} disabled={isSubmitting} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#dc2626", borderColor: "#fca5a5" }}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
