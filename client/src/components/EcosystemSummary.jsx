import React from 'react';
import { Briefcase, TrendingUp, ShieldCheck, CreditCard } from 'lucide-react';

export default function EcosystemSummary({ data }) {
  const kpis = [
    {
      title: 'Total Active Deals',
      value: data.activeDeals.value,
      icon: Briefcase,
      context: data.activeDeals.context,
      trend: data.activeDeals.trend
    },
    {
      title: 'Revenue Pipeline',
      value: data.revenuePipeline.value,
      icon: TrendingUp,
      context: data.revenuePipeline.context,
      trend: data.revenuePipeline.trend
    },
    {
      title: 'Pending Approvals',
      value: data.pendingApprovals.value,
      icon: ShieldCheck,
      context: data.pendingApprovals.context,
      trend: data.pendingApprovals.trend
    },
    {
      title: 'Payments Collected',
      value: data.paymentsCollected.value,
      icon: CreditCard,
      context: data.paymentsCollected.context,
      trend: data.paymentsCollected.trend
    }
  ];

  return (
    <div className="admin-kpi-grid">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="admin-kpi-card">
            <div className="admin-kpi-header">
              <Icon size={18} className="admin-kpi-icon" />
              {kpi.title}
            </div>
            <div className="admin-kpi-value">{kpi.value}</div>
            <div className={`admin-kpi-context ${kpi.trend}`}>
              {kpi.context}
            </div>
          </div>
        );
      })}
    </div>
  );
}
