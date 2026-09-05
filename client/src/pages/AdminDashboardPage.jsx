import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AdminHeader from '../components/AdminHeader';
import EcosystemSummary from '../components/EcosystemSummary';
import LifecycleOverview from '../components/LifecycleOverview';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import AttentionPanel from '../components/AttentionPanel';
import AdminActivityTimeline from '../components/AdminActivityTimeline';
import '../components/AdminDashboard.css';

export default function AdminDashboardPage() {
  // Mock Data
  const mockKpis = {
    activeDeals: { value: '128', context: 'this month', trend: 'trend-up' },
    revenuePipeline: { value: '₹48.6L', context: 'Across active opportunities', trend: 'trend-up' },
    pendingApprovals: { value: '14', context: 'Requires management attention', trend: 'attention' },
    paymentsCollected: { value: '₹31.2L', context: '82% collection rate', trend: 'trend-up' }
  };

  const mockLifecycleStages = [
    { name: 'Sales', count: 42, avgTime: '4 days', completionRate: '75%' },
    { name: 'Quotation', count: 28, avgTime: '2 days', completionRate: '60%' },
    { name: 'Negotiation', count: 17, avgTime: '6 days', completionRate: '85%' },
    { name: 'Approval', count: 9, avgTime: '3 days', completionRate: '95%', bottleneck: true },
    { name: 'Fulfillment', count: 14, avgTime: '5 days', completionRate: '100%' },
    { name: 'Invoice', count: 12, avgTime: '1 day', completionRate: '100%' },
    { name: 'Payment', count: 10, avgTime: '15 days', completionRate: '82%' }
  ];

  const mockAnalytics = {
    sales: { created: 145, won: 42, conversionRate: '28%' },
    negotiation: { active: 17, avgDuration: '6 Days', escalation: 3 },
    fulfillment: { inProgress: 14, delayed: 4, completed: 38 },
    finance: { received: '₹31.2L', outstanding: '₹8.4L', overdue: '₹2.1L' }
  };

  const mockAttentionItems = [
    {
      title: 'Approval Bottleneck',
      description: '5 deals have been waiting for approval for more than 48 hours.',
      severity: 'High'
    },
    {
      title: 'Delayed Fulfillment',
      description: '4 orders are past their estimated delivery date.',
      severity: 'Medium'
    },
    {
      title: 'Overdue Invoices',
      description: '6 invoices have passed their Net 30 payment terms.',
      severity: 'Medium'
    }
  ];

  const mockActivity = [
    { title: 'Payment received for INV-1042', time: '10 mins ago' },
    { title: 'Manager approved discount exception for Acme Corp', time: '45 mins ago' },
    { title: 'Warehouse marked Q-998 as fulfilled', time: '2 hours ago' },
    { title: 'Sales team created a new enterprise quotation', time: '3 hours ago' },
    { title: 'Negotiation for TechNova moved to approval', time: '5 hours ago' }
  ];

  return (
    <DashboardLayout>
      <div className="admin-dashboard-page">
        <AdminHeader />
        
        <EcosystemSummary data={mockKpis} />
        
        <LifecycleOverview stages={mockLifecycleStages} />
        
        <div className="admin-main-grid">
          <div className="admin-left-col">
            <PerformanceAnalytics analytics={mockAnalytics} />
          </div>
          <div className="admin-right-col">
            <AttentionPanel items={mockAttentionItems} />
            <AdminActivityTimeline activities={mockActivity} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
