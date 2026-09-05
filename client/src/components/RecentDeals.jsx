import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function RecentDeals() {
  const deals = [
    {
      id: 'DF-1042',
      customer: 'Acme Corporation',
      value: '₹4.8L',
      stage: 'Approval',
      status: 'Pending',
      statusClass: 'status-pending',
      lastUpdated: '10 min ago',
    },
    {
      id: 'DF-1038',
      customer: 'TechNova Solutions',
      value: '₹2.4L',
      stage: 'Negotiation',
      status: 'Active',
      statusClass: 'status-active',
      lastUpdated: '1 hr ago',
    },
    {
      id: 'DF-1031',
      customer: 'Global Supplies',
      value: '₹6.1L',
      stage: 'Fulfillment',
      status: 'In Progress',
      statusClass: 'status-in-progress',
      lastUpdated: 'Yesterday',
    },
    {
      id: 'DF-1028',
      customer: 'Vertex Enterprises',
      value: '₹1.9L',
      stage: 'Quotation',
      status: 'Draft',
      statusClass: 'status-draft',
      lastUpdated: 'Yesterday',
    },
  ];

  return (
    <div className="dashboard-card recent-deals-section">
      <div className="card-header">
        <h2 className="card-title">Recent Deals</h2>
      </div>
      <div className="table-responsive">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Deal ID</th>
              <th>Customer</th>
              <th>Deal Value</th>
              <th>Current Stage</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id}>
                <td className="deal-id">{deal.id}</td>
                <td>{deal.customer}</td>
                <td className="deal-value">{deal.value}</td>
                <td>{deal.stage}</td>
                <td>
                  <span className={`table-status ${deal.statusClass}`}>
                    {deal.status}
                  </span>
                </td>
                <td className="time-ago">{deal.lastUpdated}</td>
                <td>
                  <button className="btn-link-action">
                    View <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
