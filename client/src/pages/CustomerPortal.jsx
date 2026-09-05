import React, { useState } from "react";
import "../App.css";

function CustomerPortal({ onNavigate }) {
  const [quoteStatus, setQuoteStatus] = useState("Under Negotiation");
  const [counterDiscount, setCounterDiscount] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [lineComment, setLineComment] = useState("");
  const [notification, setNotification] = useState("");

  const [comments, setComments] = useState([
    { id: 1, line: "Extended Warranty", comment: "Can this be 15% off instead of 10%?" },
    { id: 2, line: "Onsite Setup", comment: "Can we push this to next month?" },
  ]);

  const ALLOWED_DISCOUNT_THRESHOLD = 12; // 12% max auto-approve threshold

  const handleSubmitRequest = (e) => {
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

    if (!isNaN(discountVal) && discountVal > ALLOWED_DISCOUNT_THRESHOLD) {
      // Exceeds threshold -> Triggers re-approval workflow (Screen 6)
      setQuoteStatus("Pending Re-Approval");
      setNotification(
        `Negotiation request submitted (${discountVal}% discount requested). ` +
        `Requested discount exceeds allowed threshold (${ALLOWED_DISCOUNT_THRESHOLD}%). ` +
        `Quotation has re-entered internal approval workflow (Screen 6).`
      );
    } else {
      // Within threshold -> Auto-approved for customer confirmation
      setQuoteStatus("Approved - Ready for Confirmation");
      setNotification(
        `Negotiation request accepted. Terms updated to ${discountVal || 10}% discount. ` +
        `You can now confirm the quotation.`
      );
    }
  };

  const handleConfirmQuotation = () => {
    if (quoteStatus === "Pending Re-Approval") {
      alert("Quotation is currently under internal re-approval. Please wait for sales manager approval.");
      return;
    }

    setQuoteStatus("CONFIRMED");
    setNotification("Quotation Q-1042 has been successfully CONFIRMED! Moving to Fulfillment & Invoicing.");
  };

  return (
    <main className="content">
        <h1>Customer Portal Negotiation Screen</h1>

        <p className="subtitle">
          Customer reviews and negotiates the quote directly, no email needed
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

            <button
              type="button"
              onClick={handleConfirmQuotation}
              disabled={quoteStatus === "Pending Re-Approval" || quoteStatus === "CONFIRMED"}
              style={{
                height: "40px",
                padding: "0 20px",
                borderRadius: "10px",
                border: "1px solid #222",
                background:
                  quoteStatus === "Pending Re-Approval" || quoteStatus === "CONFIRMED"
                    ? "#a5d6a7"
                    : "#299b45",
                color: "#ffffff",
                fontSize: "12px",
                cursor:
                  quoteStatus === "Pending Re-Approval" || quoteStatus === "CONFIRMED"
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {quoteStatus === "CONFIRMED" ? "Quotation Confirmed" : "Confirm Quotation"}
            </button>
          </div>
        </form>

        {/* Information Banner Box */}
        <div className="info-box" style={{ marginTop: "24px" }}>
          If final terms exceed thresholds, the quote automatically re-enters approval (Screen 6).
        </div>
      </main>
  );
}

export default CustomerPortal;
