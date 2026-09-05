import React, { useState } from 'react';
import { Plus } from 'lucide-react';
// import QuotationSummary from '../components/QuotationSummary';
// import QuotationToolbar from '../components/QuotationToolbar';
// import QuotationBoard from '../components/QuotationBoard';
// import '../components/Quotations.css';

// Initial Mock Data
const initialQuotations = [
  { id: "Q-1042", customer: "Acme Corporation", title: "Enterprise Software Package", value: "₹4.80L", stage: "Approval", updated: "10 min ago", isPriority: true },
  { id: "Q-1041", customer: "TechNova Solutions", title: "Cloud Migration Services", value: "₹2.40L", stage: "Draft", updated: "1 hr ago", isPriority: false },
  { id: "Q-1040", customer: "Vertex Enterprises", title: "Annual Support Contract", value: "₹6.10L", stage: "Accepted", updated: "Yesterday", isPriority: false },
  { id: "Q-1039", customer: "Global Supplies", title: "Hardware Procurement", value: "₹1.90L", stage: "Sent", updated: "2 days ago", isPriority: false },
  { id: "Q-1038", customer: "Nova Industries", title: "Security Audit Framework", value: "₹3.75L", stage: "Negotiation", updated: "3 days ago", isPriority: true },
  { id: "Q-1037", customer: "Acme Corporation", title: "Additional License Pack", value: "₹0.85L", stage: "Draft", updated: "Just now", isPriority: false },
  { id: "Q-1036", customer: "TechNova Solutions", title: "Managed Services Q3", value: "₹1.20L", stage: "Sent", updated: "4 hrs ago", isPriority: false },
];

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState(initialQuotations);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Handle Drag & Drop move
  const handleDropQuotation = (quoteId, newStage) => {
    setQuotations(prevQuotes => 
      prevQuotes.map(q => q.id === quoteId ? { ...q, stage: newStage } : q)
    );
  };

  // Filter Logic
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = 
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCustomer = customerFilter === 'All' || q.customer === customerFilter;
    const matchesStatus = statusFilter === 'All' || q.stage === statusFilter;

    return matchesSearch && matchesCustomer && matchesStatus;
  });

  return (
    <main className="content">
      <div className="quotations-page">
        {/* Header */}
        <div className="quotations-header">
          <div>
            <span className="ops-label">Sales Operations</span>
            <h1 className="page-title">Quotations</h1>
            <p className="page-subtitle">Create, track and manage quotations across your active deal pipeline.</p>
          </div>
          <button className="btn-primary">
            <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            New Quotation
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="info-box" style={{ marginTop: '20px' }}>
          Quotations board coming soon.
        </div>
      </div>
    </main>
  );
}
