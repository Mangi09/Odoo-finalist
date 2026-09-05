import React from 'react';
import { Activity, AlertTriangle, ShieldAlert, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';

export default function HealthOverview() {
  const kpis = [
    {
      title: 'Healthy Deals',
      value: '24',
      icon: Activity,
      iconClass: 'healthy',
      trend: '+8%',
      trendDesc: 'from last period',
      trendPositive: true
    },
    {
      title: 'Deals at Risk',
      value: '7',
      icon: AlertTriangle,
      iconClass: 'warning',
      trend: 'Requires attention',
      trendPositive: false
    },
    {
      title: 'Critical Anomalies',
      value: '3',
      icon: ShieldAlert,
      iconClass: 'critical',
      trend: 'Immediate review needed',
      trendPositive: false
    },
    {
      title: 'Revenue at Risk',
      value: '₹18.4L',
      icon: IndianRupee,
      iconClass: 'revenue',
      trend: 'Across active negotiations',
      trendPositive: false
    }
  ];

  return (
    <div className="dh-kpi-grid">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="dh-kpi-card">
            <div className="dh-kpi-header">
              <div className={`dh-kpi-icon ${kpi.iconClass}`}>
                <Icon size={18} />
              </div>
              {kpi.title}
            </div>
            <div className="dh-kpi-value">{kpi.value}</div>
            <div className={`dh-kpi-trend ${kpi.trendPositive ? 'positive' : 'negative'}`}>
              {kpi.trendDesc ? (
                <>
                  {kpi.trendPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {kpi.trend} <span style={{ color: 'var(--text-muted)' }}>{kpi.trendDesc}</span>
                </>
              ) : (
                <span>{kpi.trend}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
