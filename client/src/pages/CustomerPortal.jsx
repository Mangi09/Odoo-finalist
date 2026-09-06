import React, { useEffect, useState } from "react";
import "../App.css";
import { api } from "../services/api";

function CustomerPortal({ onNavigate, quote, currentUser }) {
  const [quoteStatus, setQuoteStatus] = useState("");
  const [quotation, setQuotation] = useState(null);
  const [orders, setOrders] = useState([]);
  const [portalQuotations, setPortalQuotations] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [adminRequests, setAdminRequests] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [counterDiscount, setCounterDiscount] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [lineComment, setLineComment] = useState("");
  const [notification, setNotification] = useState("");
  const [comments, setComments] = useState([]);

  const ALLOWED_DISCOUNT_THRESHOLD = 12; // 12% max auto-approve threshold
  const formatAmount = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  const isStaff = ['admin', 'sales_manager', 'salesperson'].includes(currentUser?.role);
  const representedCompany = currentUser?.companyName || quotation?.customer?.name || quotation?.customerName || "";

  useEffect(() => {
    if (isStaff) {
      api.portal.getAdminRequests()
        .then(data => setAdminRequests(Array.isArray(data) ? data : []))
        .catch(err => setNotification(`Unable to load customer requests: ${err.message}`));
      return;
    }

    const loadCustomerPortal = async () => {
      try {
        // 1. Fetch portal quotations (sent/active)
        const pQuotes = await api.portal.getQuotations();
        const quoteList = Array.isArray(pQuotes) ? pQuotes : [];
        setPortalQuotations(quoteList);

        // 2. Also load any existing orders (for order-linked negotiations)
        const ownOrders = await api.salesOrders.getAll().catch(() => []);
        setOrders(Array.isArray(ownOrders) ? ownOrders : []);

        // 3. Auto-select: prefer quote from navigation prop, else first in list
        const preferredQuote = quote?._id
          ? quoteList.find(q => q._id === quote._id || q.id === quote.id)
          : null;
        const firstQuote = preferredQuote || quoteList[0];

        if (firstQuote) {
          setSelectedQuoteId(firstQuote._id);
          // Fetch full quotation detail
          const detail = await api.portal.getQuotation(firstQuote._id);
          setQuotation(detail);
          setQuoteStatus(detail.status || firstQuote.status);
          setComments((detail.items || []).map(item => ({ id: item.id, line: item.name, comment: "No comments yet" })));
          // Link to order if exists
          if (firstQuote.orderId) setSelectedOrderId(firstQuote.orderId);
        }
      } catch (err) {
        setNotification(`Unable to load your quotations: ${err.message}`);
      }
    };
    loadCustomerPortal();
  }, [quote, currentUser?.role, isStaff]);

  const handleQuoteSelect = async (qId) => {
    setSelectedQuoteId(qId);
    try {
      const detail = await api.portal.getQuotation(qId);
      setQuotation(detail);
      setQuoteStatus(detail.status);
      setComments((detail.items || []).map(item => ({ id: item.id, line: item.name, comment: "No comments yet" })));
      const pq = portalQuotations.find(q => q._id === qId);
      if (pq?.orderId) setSelectedOrderId(pq.orderId);
      else setSelectedOrderId("");
      setNotification("");
    } catch (err) {
      setNotification(`Unable to load quotation: ${err.message}`);
    }
  };


  const handleOrderChange = async (event) => {
    const order = orders.find(item => item._id === event.target.value);
    setSelectedOrderId(event.target.value);
    if (!order) return;
    try {
      const detail = await api.quotations.getById(order.quotationId);
      setQuotation(detail);
      setQuoteStatus(detail.stage || order.status);
      setComments((detail.items || []).map(item => ({ id: item._id, line: item.product, comment: "No comments yet" })));
    } catch (err) {
      setNotification(`Unable to load order quotation: ${err.message}`);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!counterDiscount && !requestedDate && !lineComment) {
      alert("Please enter a counter discount %, requested delivery date, or comment.");
      return;
    }

    const discountVal = parseFloat(counterDiscount);
    let newComments = [...comments];

    if (lineComment) {
      newComments.push({
        id: Date.now(),
        line: "General Request",
        comment: lineComment,
      });
      setComments(newComments);
    }

    if (!quotation) return;
    try {
      const result = await api.portal.negotiate(quotation._id, {
        orderId: selectedOrderId || null,
        counterDiscount: discountVal || 0,
        requestedDate,
        lineComment
      });
      const nextStatus = result?.quoteStatus || (!isNaN(discountVal) && discountVal > ALLOWED_DISCOUNT_THRESHOLD ? "RE_APPROVAL" : "NEGOTIATION");
      setQuoteStatus(nextStatus);
      setNotification(result?.notification || "Negotiation request submitted.");
      // Refresh portal quotation list so status badge updates
      api.portal.getQuotations().then(d => setPortalQuotations(Array.isArray(d) ? d : [])).catch(() => {});
    } catch (err) {
      setNotification(`Unable to submit request: ${err.message}`);
    }
  };


  return (
    <main className="content">
      {isStaff ? (
        <>
          <h1>Customer Portal Requests</h1>
          <p className="subtitle">Customer negotiation and change requests mapped to their assigned orders.</p>

          {notification && (
            <div className="info-box" style={{ marginTop: "14px", marginBottom: "14px" }}>
              {notification}
            </div>
          )}

          <div className="table-wrapper" style={{ marginTop: "16px" }}>
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Order Number</th>
                  <th>Request</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {adminRequests.length > 0 ? adminRequests.map(request => (
                  <tr key={request._id}>
                    <td style={{ fontWeight: 600, color: "#1a365d" }}>{request.customerName}</td>
                    <td>{request.orderNumber}</td>
                    <td>{request.request}</td>
                    <td>
                      <span className={`badge ${request.status === 'REJECTED' ? 'red' : (request.status === 'APPROVED' ? 'green' : 'orange')}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "#718096" }}>
                      No customer requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
        <h1>Customer Portal Negotiation Screen</h1>

        <p className="subtitle">
          {representedCompany ? `${representedCompany} — ` : ''}Customer reviews and negotiates the quote directly, no email needed
        </p>

        {/* Quotation Status Card */}
        <div className="status-container">
          <div
            className={`status ${
              quoteStatus === "CONFIRMED"
                ? "approved"
                : quoteStatus === "Pending Re-Approval"
                ? "returned"
                : "pending"
            }`}
            style={{ width: "auto", padding: "0 16px", minWidth: "160px" }}
          >
            <span>Status: {quoteStatus}</span>
          </div>
        </div>

        {notification && (
          <div className="info-box" style={{ marginTop: "14px", marginBottom: "14px" }}>
            {notification}
          </div>
        )}

        {quotation && (
          <div className="page-card" style={{ marginTop: "16px" }}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ minWidth: "160px" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Subtotal</div>
                <strong>{formatAmount(quotation.subtotalAmount || quotation.totalAmount)}</strong>
              </div>
              <div style={{ minWidth: "160px" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Global Discount</div>
                <strong>-{formatAmount(quotation.globalDiscountAmount)}</strong>
              </div>
              <div style={{ minWidth: "160px" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Final Total</div>
                <strong>{formatAmount(quotation.totalAmount)}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Customer Comments Table */}
        <div className="table-wrapper" style={{ marginTop: "16px" }}>
          <table>
            <thead>
              <tr>
                <th>Line</th>
                <th>Customer Comment</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: "500" }}>{item.line}</td>
                  <td>{item.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customer Input Section */}
        <form onSubmit={handleSubmitRequest} style={{ marginTop: "24px" }}>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "18px" }}>
            <div style={{ flex: "1", minWidth: "240px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px" }}>
                Order Number
              </label>
              <select
                value={selectedOrderId}
                onChange={handleOrderChange}
                style={{ width: "100%", height: "45px", border: "1px solid #555", borderRadius: "9px", padding: "0 14px", fontSize: "13px", outline: "none" }}
              >
                <option value="">Select an order...</option>
                {orders.map(order => <option key={order._id} value={order._id}>{order.orderNumber || order.id}</option>)}
              </select>
            </div>
            <div style={{ flex: "1", minWidth: "240px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px" }}>
                Counter Discount %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="e.g. 15"
                value={counterDiscount}
                onChange={(e) => setCounterDiscount(e.target.value)}
                style={{
                  width: "100%",
                  height: "45px",
                  border: "1px solid #555",
                  borderRadius: "9px",
                  padding: "0 14px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ flex: "1", minWidth: "240px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px" }}>
                Requested Delivery Date
              </label>
              <input
                type="date"
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                style={{
                  width: "100%",
                  height: "45px",
                  border: "1px solid #555",
                  borderRadius: "9px",
                  padding: "0 14px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px" }}>
              Line Comment (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Can we push onsite setup to next month?"
              value={lineComment}
              onChange={(e) => setLineComment(e.target.value)}
              style={{
                width: "100%",
                height: "45px",
                border: "1px solid #555",
                borderRadius: "9px",
                padding: "0 14px",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "14px", marginTop: "16px" }}>
            <button
              type="submit"
              style={{
                height: "40px",
                padding: "0 20px",
                borderRadius: "10px",
                border: "1px solid #777",
                background: "#ffffff",
                fontSize: "12px",
                cursor: "pointer",
                color: "#222",
              }}
            >
              Submit Request
            </button>
          </div>
        </form>

        {/* Information Banner Box */}
        <div className="info-box" style={{ marginTop: "24px" }}>
          If final terms exceed thresholds, the quote automatically re-enters approval (Screen 6).
        </div>
        </>
      )}
      </main>
  );
}

export default CustomerPortal;
