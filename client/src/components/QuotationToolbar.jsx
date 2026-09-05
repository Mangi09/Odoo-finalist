import React from 'react';
import { Search } from 'lucide-react';

export default function QuotationToolbar({ searchQuery, setSearchQuery, customerFilter, setCustomerFilter, statusFilter, setStatusFilter }) {
  return (
    <div className="quotation-toolbar">
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search by quotation ID or customer..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <select 
          className="filter-select" 
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
        >
          <option value="All">All Customers</option>
          <option value="Acme Corporation">Acme Corporation</option>
          <option value="TechNova Solutions">TechNova Solutions</option>
          <option value="Vertex Enterprises">Vertex Enterprises</option>
          <option value="Global Supplies">Global Supplies</option>
          <option value="Nova Industries">Nova Industries</option>
        </select>
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Approval">Approval</option>
          <option value="Accepted">Accepted</option>
        </select>
      </div>
    </div>
  );
}
