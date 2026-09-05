import "../App.css";

function App() {
  const approvals = [
    {
      quotation: "Q-1042",
      customer: "Acme Corp",
      risk: "HIGH",
      stage: "Sales Manager",
      assigned: "M. Shah",
    },
    {
      quotation: "Q-1039",
      customer: "Beta Industries",
      risk: "MEDIUM",
      stage: "Finance",
      assigned: "R. Iyer",
    },
    {
      quotation: "Q-1035",
      customer: "Nova Retail",
      risk: "LOW",
      stage: "Auto-Approved",
      assigned: "-",
    },
  ];

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">DealFlow360</div>

        <div className="nav-links">
          <button>Dashboard</button>
          <button>Quotations</button>
          <button className="active">Approvals</button>
          <button>Fulfillment</button>
          <button>Subscriptions</button>
          <button>Invoices</button>
          <button>Deal Health</button>
          <button>Reports</button>
          <button>Product</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="content">
        <h1>Approvals (List)</h1>

        <p className="subtitle">
          Every quotation that needed, needs, or is going through discount approval
        </p>

        {/* Status Cards */}
        <div className="status-container">
          <div className="status pending">
            <span>3 Pending</span>
          </div>

          <div className="status returned">
            <span>1 Returned</span>
          </div>

          <div className="status approved">
            <span>12 Approved</span>
          </div>
        </div>

        {/* Approval Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Quotation</th>
                <th>Customer</th>
                <th>Blended Risk</th>
                <th>Stage</th>
                <th>Assigned To</th>
              </tr>
            </thead>

            <tbody>
              {approvals.map((approval, index) => (
                <tr key={index}>
                  <td>{approval.quotation}</td>
                  <td>{approval.customer}</td>
                  <td>{approval.risk}</td>
                  <td>{approval.stage}</td>
                  <td>{approval.assigned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Information Box */}
        <div className="info-box">
          Click any row to open its full approval detail, risk breakdown, and audit trail.
        </div>

        {/* Filter */}
        <div className="filter-section">
          <label htmlFor="filter">Filter:</label>

          <select id="filter" defaultValue="pending">
            <option value="pending">Pending Only</option>
            <option value="returned">Returned</option>
            <option value="approved">Approved</option>
            <option value="all">All</option>
          </select>
        </div>
      </main>
    </div>
  );
}

export default App;