import React, { useState } from "react";
import "../App.css";

const defaultInvoices = [
  { id: "INV-1042", customer: "Acme Corp", amount: "$2,730", status: "Unpaid", dueDate: "Sep 10", type: "One-Time" },
  { id: "INV-1043", customer: "Acme Corp", amount: "$46", status: "Paid", dueDate: "Sep 15", type: "Recurring" },
  { id: "INV-1038", customer: "Nova Retail", amount: "$9,750", status: "Paid", dueDate: "Aug 30", type: "One-Time" },
  { id: "INV-1044", customer: "Beta Industries", amount: "$1,200", status: "Unpaid", dueDate: "Oct 01", type: "Recurring" },
  { id: "INV-1045", customer: "Delta LLC", amount: "$3,400", status: "Paid", dueDate: "Jul 20", type: "One-Time" },
  { id: "INV-1046", customer: "Apex Systems", amount: "$899", status: "Paid", dueDate: "Sep 01", type: "Recurring" },
  { id: "INV-1047", customer: "CyberDyne Inc", amount: "$4,800", status: "Unpaid", dueDate: "Nov 15", type: "Recurring" },
  { id: "INV-1048", customer: "Omni Consumer Products", amount: "$1,500", status: "Paid", dueDate: "Aug 15", type: "Recurring" },
  { id: "INV-1049", customer: "Stark Logistics", amount: "$2,200", status: "Paid", dueDate: "Sep 05", type: "Recurring" },
  { id: "INV-1050", customer: "Wayne Tech", amount: "$5,000", status: "Paid", dueDate: "Aug 10", type: "Recurring" },
  { id: "INV-1051", customer: "Hooli Cloud", amount: "$650", status: "Paid", dueDate: "Sep 02", type: "Recurring" },
  { id: "INV-1052", customer: "Pied Piper", amount: "$950", status: "Paid", dueDate: "Aug 28", type: "Recurring" },
  { id: "INV-1053", customer: "Initech Solutions", amount: "$350", status: "Unpaid", dueDate: "Sep 12", type: "Recurring" },
  { id: "INV-1054", customer: "Massive Dynamic", amount: "$4,200", status: "Paid", dueDate: "Jan 10", type: "Recurring" },
  { id: "INV-1055", customer: "Umbrella Corp", amount: "$750", status: "Paid", dueDate: "Aug 19", type: "Recurring" },
  { id: "INV-1056", customer: "Globex Corp", amount: "$1,800", status: "Paid", dueDate: "Aug 05", type: "Recurring" },
  { id: "INV-1057", customer: "InGen Labs", amount: "$800", status: "Paid", dueDate: "Aug 08", type: "Recurring" },
  { id: "INV-1058", customer: "Tyrell Corp", amount: "$6,000", status: "Paid", dueDate: "Aug 20", type: "Recurring" },
  { id: "INV-1059", customer: "Oscorp Industries", amount: "$550", status: "Paid", dueDate: "Aug 22", type: "Recurring" },
  { id: "INV-1060", customer: "Virtucon Systems", amount: "$450", status: "Paid", dueDate: "Sep 04", type: "Recurring" },
  { id: "INV-1061", customer: "Wonka Industries", amount: "$1,100", status: "Paid", dueDate: "Aug 18", type: "Recurring" },
  { id: "INV-1062", customer: "Cybertron Tech", amount: "$180", status: "Paid", dueDate: "Jul 15", type: "One-Time" },
  { id: "INV-1063", customer: "Zenith Global", amount: "$150", status: "Paid", dueDate: "Jun 20", type: "One-Time" },
  { id: "INV-1064", customer: "Soylent Corp", amount: "$120", status: "Paid", dueDate: "Jul 01", type: "One-Time" },
  { id: "INV-1065", customer: "Acme Corp", amount: "$450", status: "Paid", dueDate: "Aug 01", type: "One-Time" },
];

function Invoices({ onNavigate }) {
  const [filter, setFilter] = useState("all");

  const unpaidCount = defaultInvoices.filter((i) => i.status === "Unpaid").length;
  const paidCount = defaultInvoices.filter((i) => i.status === "Paid").length;

  const filteredInvoices = defaultInvoices.filter((inv) => {
    if (filter === "all") return true;
    return inv.status.toLowerCase() === filter.toLowerCase();
  });

  const handleRowClick = (inv) => onNavigate && onNavigate("invoice-detail", inv);

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "quotations", label: "Quotations" },
    { id: "approvals", label: "Approvals" },
    { id: "fulfillment", label: "Fulfillment" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "invoices", label: "Invoices" },
    { id: "deal-health", label: "Deal Health" },
    { id: "reports", label: "Reports" },
    { id: "product", label: "Product" },
    { id: "customer-portal", label: "Customer Portal" },
  ];

  return (
    <main className="content">
        <h1>Invoices (List)</h1>

        <p className="subtitle">
          Every invoice generated from one-time and recurring orders
        </p>

        {/* Status Counters */}
        <div className="status-container">
          <div className="status returned">
            <span>{unpaidCount} Unpaid</span>
          </div>

          <div className="status approved">
            <span>{paidCount} Paid</span>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} onClick={() => handleRowClick(inv)}>
                  <td style={{ fontWeight: "500" }}>{inv.id}</td>
                  <td>{inv.customer}</td>
                  <td>{inv.amount}</td>
                  <td style={{ color: inv.status === "Unpaid" ? "#e82d32" : "#299b45", fontWeight: "500" }}>
                    {inv.status}
                  </td>
                  <td>{inv.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Information Box */}
        <div className="info-box" style={{ marginTop: "20px" }}>
          Click an invoice row to open its full payment and delivery reconciliation detail.
        </div>

        {/* Filter Section */}
        <div className="filter-section" style={{ marginTop: "18px" }}>
          <label htmlFor="filter">Filter:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Invoices</option>
            <option value="unpaid">Unpaid Only</option>
            <option value="paid">Paid Only</option>
          </select>
        </div>
      </main>
  );
}

export default Invoices;
