import React, { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import "../App.css";

const productCatalog = {
  "Laptop Pro 14": { price: 1200, limit: 15 },
  "Onsite Setup Service": { price: 450, limit: 10 },
  "Extended Warranty": { price: 180, limit: 15 },
  "Docking Station": { price: 180, limit: 15 },
  "Care Plan 2yr": { price: 46, limit: 12 },
};

const createLine = (product = "Laptop Pro 14") => ({
  id: crypto.randomUUID(),
  product,
  qty: 1,
  discount: 0,
});

export default function NewQuotationPage({ onNavigate, onSaveQuotation }) {
  const [customer, setCustomer] = useState("Acme Corp");
  const [priceList, setPriceList] = useState("Gold");
  const [validUntil, setValidUntil] = useState("2026-09-30");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [deliveryDate, setDeliveryDate] = useState("2026-09-15");
  const [internalNote, setInternalNote] = useState("Discount checked against line limits before approval.");
  const [lines, setLines] = useState([
    { ...createLine("Laptop Pro 14"), qty: 2, discount: 5 },
    { ...createLine("Onsite Setup Service"), qty: 1, discount: 0 },
  ]);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    const subtotal = lines.reduce((total, line) => {
      const catalogItem = productCatalog[line.product];
      const lineTotal = catalogItem.price * Number(line.qty || 0);
      return total + lineTotal - (lineTotal * Number(line.discount || 0)) / 100;
    }, 0);

    return {
      subtotal,
      formattedTotal: `$${subtotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      needsApproval: lines.some((line) => Number(line.discount || 0) > productCatalog[line.product].limit),
    };
  }, [lines]);

  const updateLine = (id, field, value) => {
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, [field]: value } : line))
    );
  };

  const addLine = (product) => {
    setLines((current) => [...current, createLine(product)]);
  };

  const removeLine = (id) => {
    setLines((current) => current.filter((line) => line.id !== id));
  };

  const saveQuotation = (event) => {
    event.preventDefault();
    if (!customer.trim()) {
      setError("Customer is required.");
      return;
    }
    if (lines.length === 0) {
      setError("Add at least one product line.");
      return;
    }

    setError("");
    onSaveQuotation({
      customer,
      priceList,
      validUntil,
      paymentTerms,
      deliveryDate,
      amount: summary.formattedTotal,
      total: summary.formattedTotal,
      needsApproval: summary.needsApproval,
      lines,
      internalNote,
    });
  };

  return (
    <main className="content">
      <form className="page-card" onSubmit={saveQuotation}>
        <div className="page-header">
          <div className="page-header-left">
            <span className="ops-label">New Quotation</span>
            <h1>Create Quotation</h1>
            <p className="subtitle">Create a draft quotation with customer terms, product lines, discounts and suggested add-ons.</p>
          </div>
          <button type="button" className="btn-outline" onClick={() => onNavigate && onNavigate("quotations")}>
            Back to Quotations
          </button>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="quote-customer">Customer</label>
            <input id="quote-customer" type="text" value={customer} onChange={(event) => setCustomer(event.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="quote-price-list">Price List</label>
            <select id="quote-price-list" value={priceList} onChange={(event) => setPriceList(event.target.value)}>
              <option>Gold</option>
              <option>Silver</option>
              <option>Bronze</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="quote-valid">Valid Until</label>
            <input id="quote-valid" type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="quote-delivery">Requested Delivery Date</label>
            <input id="quote-delivery" type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} />
          </div>
          <div className="form-field full-width">
            <label htmlFor="quote-payment">Payment Terms</label>
            <select id="quote-payment" value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)}>
              <option>Net 30</option>
              <option>Net 15</option>
              <option>Due on receipt</option>
            </select>
          </div>
        </div>

        {error && <div className="info-box" style={{ marginTop: "18px" }}>{error}</div>}
      </form>

      <div className="page-card">
        <div className="section-header">
          <h2>Product Lines</h2>
          <button type="button" className="btn-secondary" onClick={() => addLine("Extended Warranty")}>
            <Plus size={16} />
            Add Product
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Limit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const product = productCatalog[line.product];
                const overLimit = Number(line.discount || 0) > product.limit;

                return (
                  <tr key={line.id}>
                    <td>
                      <select value={line.product} onChange={(event) => updateLine(line.id, "product", event.target.value)}>
                        {Object.keys(productCatalog).map((name) => <option key={name}>{name}</option>)}
                      </select>
                    </td>
                    <td><input type="number" min="1" value={line.qty} onChange={(event) => updateLine(line.id, "qty", event.target.value)} /></td>
                    <td>${product.price.toLocaleString("en-US")}</td>
                    <td><input type="number" min="0" max="100" value={line.discount} onChange={(event) => updateLine(line.id, "discount", event.target.value)} /></td>
                    <td>{product.limit}%</td>
                    <td><span className={`badge ${overLimit ? "red" : "green"}`}>{overLimit ? "OVER" : "OK"}</span></td>
                    <td>
                      <button type="button" className="btn-outline" onClick={() => removeLine(line.id)} aria-label={`Remove ${line.product}`}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="info-box" style={{ marginTop: "18px" }}>
          Discount is checked against each line's own limit live, before submit. Over-limit discounts can still be saved as draft and sent to approval.
        </div>
      </div>

      <div className="page-card">
        <h2>Upsell and Cross-Sell Suggestions</h2>
        <div className="mini-card-grid">
          <button type="button" className="flow-record-card" onClick={() => addLine("Docking Station")}><strong>+ Docking Station</strong><span>Promo: 12% off</span></button>
          <button type="button" className="flow-record-card" onClick={() => addLine("Care Plan 2yr")}><strong>+ Care Plan 2yr</strong><span>Margin +$46</span></button>
          <button type="button" className="flow-record-card" onClick={() => addLine("Extended Warranty")}><strong>+ Extended Warranty</strong><span>Margin +$18</span></button>
        </div>

        <div className="form-field" style={{ marginTop: "20px" }}>
          <label htmlFor="quote-note">Internal Notes</label>
          <textarea id="quote-note" value={internalNote} onChange={(event) => setInternalNote(event.target.value)} />
        </div>

        <div className="page-actions">
          <div>
            <div className="metric-label">Quotation Total</div>
            <div className="metric-value">{summary.formattedTotal}</div>
          </div>
          <div className="button-row">
            <button type="button" className="btn-outline" onClick={() => onNavigate && onNavigate("quotations")}>Cancel</button>
            <button type="button" className="btn-secondary" onClick={saveQuotation}>Save Draft</button>
            <button type="button" className="btn-primary" onClick={saveQuotation}>Save Quotation</button>
          </div>
        </div>
      </div>
    </main>
  );
}
