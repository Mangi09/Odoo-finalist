import React from 'react';
// import DealHealthHeader from '../components/DealHealthHeader';
// import HealthOverview from '../components/HealthOverview';
// import HealthDistribution from '../components/HealthDistribution';
// import AnomalyList from '../components/AnomalyList';
// import AtRiskDealsTable from '../components/AtRiskDealsTable';
// import AIInsightsPanel from '../components/AIInsightsPanel';
// import '../components/DealHealth.css';

export default function DealHealthPage() {
  
  // Mock Data
  const mockAnomalies = [
    {
      deal: "Enterprise Software Renewal",
      customer: "Acme Corporation",
      severity: "High",
      description: "Negotiation stalled for 14 days without customer response.",
      recommendation: "Follow up with the customer decision-maker."
    },
    {
      deal: "Annual Services Contract",
      customer: "TechNova Solutions",
      severity: "Critical",
      description: "Deal value dropped by 45% after initial quotation phase.",
      recommendation: "Review pricing changes and recent communications immediately."
    },
    {
      deal: "Bulk Hardware Order",
      customer: "Global Supplies",
      severity: "Medium",
      description: "Requested discount exceeds category average by 8%.",
      recommendation: "Review discount approval policies for this tier."
    }
  ];

  const mockAtRiskDeals = [
    {
      deal: "Q3 Cloud Migration",
      customer: "Vertex Enterprises",
      stage: "Approval",
      healthScore: 72,
      risk: "Low",
      lastActivity: "2 days ago"
    },
    {
      deal: "Security Audit Framework",
      customer: "Nova Industries",
      stage: "Negotiation",
      healthScore: 48,
      risk: "Medium",
      lastActivity: "8 days ago"
    },
    {
      deal: "Managed Services Q4",
      customer: "TechNova Solutions",
      stage: "Quotation",
      healthScore: 31,
      risk: "High",
      lastActivity: "15 days ago"
    }
  ];

  const mockInsights = [
    "Deals with no activity for more than 10 days are 2.3× more likely to require discount escalation.",
    "Enterprise deals currently in negotiation show the highest revenue exposure this quarter.",
    "3 active deals are approaching their expected close date without reaching the approval stage."
  ];

  return (
    <main className="content">
      <div className="deal-health-page">
        <div className="info-box" style={{ marginTop: '20px' }}>
          Deal Health components coming soon.
        </div>
      </div>
    </main>
  );
}
