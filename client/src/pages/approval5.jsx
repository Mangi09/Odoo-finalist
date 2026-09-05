import "../App.css";
function Approvals({ onNavigate }) {
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
    <main className="content">
      <div className="page-card approvals-page">
        <div className="approvals-header">
          <h1>Approvals (List)</h1>

          <p className="subtitle">
            Every quotation that needed, needs, or is going through discount approval
          </p>
        </div>

        {/* Status Cards */}
        <div className="status-container approvals-status-row">
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
        <div className="table-wrapper approvals-table">
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
                <tr key={index} onClick={() => onNavigate && onNavigate("approval-detail", approval)}>
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
        <div className="info-box approvals-info">
          Click any row to open its full approval detail, risk breakdown, and audit trail.
        </div>

        {/* Filter */}
        <div className="filter-section approvals-filter">
          <label htmlFor="filter">Filter:</label>

          <select id="filter" defaultValue="pending">
            <option value="pending">Pending Only</option>
            <option value="returned">Returned</option>
            <option value="approved">Approved</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
    </main>
  );
}

export default Approvals;
