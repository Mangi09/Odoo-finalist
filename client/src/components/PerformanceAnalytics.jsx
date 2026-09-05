import React from 'react';
import { Target, MessageSquare, Truck, DollarSign } from 'lucide-react';

export default function PerformanceAnalytics({ analytics }) {
  return (
    <div className="analytics-grid">
      {/* Sales Performance */}
      <div className="analytic-card">
        <div className="analytic-header">
          <Target size={16} /> Sales Performance
        </div>
        <div className="analytic-metrics">
          <div className="analytic-row">
            <span>Deals Created</span>
            <span className="analytic-val">{analytics.sales.created}</span>
          </div>
          <div className="analytic-row">
            <span>Deals Won</span>
            <span className="analytic-val">{analytics.sales.won}</span>
          </div>
          <div className="analytic-row">
            <span>Conversion Rate</span>
            <span className="analytic-val">{analytics.sales.conversionRate}</span>
          </div>
          <div className="mini-chart-bar">
            <div className="mini-chart-fill" style={{ width: analytics.sales.conversionRate }}></div>
          </div>
        </div>
      </div>

      {/* Negotiation Insights */}
      <div className="analytic-card">
        <div className="analytic-header">
          <MessageSquare size={16} /> Negotiation Insights
        </div>
        <div className="analytic-metrics">
          <div className="analytic-row">
            <span>Active Negotiations</span>
            <span className="analytic-val">{analytics.negotiation.active}</span>
          </div>
          <div className="analytic-row">
            <span>Average Duration</span>
            <span className="analytic-val">{analytics.negotiation.avgDuration}</span>
          </div>
          <div className="analytic-row">
            <span>Requires Escalation</span>
            <span className="analytic-val" style={{ color: 'var(--light-coral-dark)' }}>{analytics.negotiation.escalation}</span>
          </div>
        </div>
      </div>

      {/* Fulfillment Status */}
      <div className="analytic-card">
        <div className="analytic-header">
          <Truck size={16} /> Fulfillment Status
        </div>
        <div className="analytic-metrics">
          <div className="analytic-row">
            <span>Orders in Progress</span>
            <span className="analytic-val">{analytics.fulfillment.inProgress}</span>
          </div>
          <div className="analytic-row">
            <span>Delayed Orders</span>
            <span className="analytic-val" style={{ color: 'var(--light-coral-dark)' }}>{analytics.fulfillment.delayed}</span>
          </div>
          <div className="analytic-row">
            <span>Completed</span>
            <span className="analytic-val">{analytics.fulfillment.completed}</span>
          </div>
          <div className="mini-chart-bar">
            <div className="mini-chart-fill" style={{ width: '75%', backgroundColor: '#10b981' }}></div>
          </div>
        </div>
      </div>

      {/* Finance Overview */}
      <div className="analytic-card">
        <div className="analytic-header">
          <DollarSign size={16} /> Finance Overview
        </div>
        <div className="analytic-metrics">
          <div className="analytic-row">
            <span>Payments Received</span>
            <span className="analytic-val">{analytics.finance.received}</span>
          </div>
          <div className="analytic-row">
            <span>Outstanding Invoices</span>
            <span className="analytic-val">{analytics.finance.outstanding}</span>
          </div>
          <div className="analytic-row">
            <span>Overdue Amount</span>
            <span className="analytic-val" style={{ color: 'var(--light-coral-dark)' }}>{analytics.finance.overdue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
