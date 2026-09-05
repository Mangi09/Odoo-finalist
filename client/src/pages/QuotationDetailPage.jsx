import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import QuotationHeader from '../components/QuotationHeader';
import QuotationTimeline from '../components/QuotationTimeline';
import { CustomerInfo, QuotationDetails } from '../components/QuotationInfoGrids';
import LineItemsTable from '../components/LineItemsTable';
import AddProductModal from '../components/AddProductModal';
import FinancialSummary from '../components/FinancialSummary';
import DiscountAnalysis from '../components/DiscountAnalysis';
import NextActionCard from '../components/NextActionCard';
import InternalNotes from '../components/InternalNotes';
import ActivityHistory from '../components/ActivityHistory';
import '../components/QuotationDetail.css';

export default function QuotationDetailPage() {
  const { id } = useParams();
  const displayId = id || 'Q-1042'; // Fallback for direct access without ID

  // Initial Mock Data
  const initialData = {
    id: displayId,
    title: 'Enterprise Software Package',
    stage: 'Negotiation',
    customer: {
      name: 'Acme Corporation',
      contact: 'John Carter',
      email: 'john.carter@acmecorp.com',
      phone: '+91 98765 XXXXX',
      category: 'Enterprise'
    },
    details: {
      date: '12 September 2026',
      validity: '30 September 2026',
      salesperson: 'Atharva K.',
      paymentTerms: 'Net 30',
      currency: 'INR'
    },
    items: [
      { id: 1, product: 'Enterprise Analytics Suite', description: 'Advanced analytics and reporting platform', quantity: 1, unitPrice: 350000, discountPercent: 10 },
      { id: 2, product: 'Workflow Automation Module', description: 'Business workflow automation', quantity: 1, unitPrice: 150000, discountPercent: 5 },
      { id: 3, product: 'Premium Support', description: 'Annual enterprise support', quantity: 1, unitPrice: 50000, discountPercent: 0 }
    ],
    activities: [
      { title: 'Quotation created', time: 'Today, 10:20 AM' },
      { title: 'Discount updated', time: 'Today, 11:05 AM' },
      { title: 'Customer negotiation completed', time: 'Today, 12:30 PM' },
      { title: 'Ready for approval', time: 'Today, 1:15 PM' }
    ]
  };

  const [quotation, setQuotation] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleAddProduct = (newProduct) => {
    const newItem = {
      id: Date.now(),
      ...newProduct
    };
    setQuotation(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleSubmitApproval = () => {
    setQuotation(prev => ({
      ...prev,
      stage: 'Approval Pending',
      activities: [
        ...prev.activities,
        { title: 'Submitted for manager approval', time: 'Just now' }
      ]
    }));
    setToastMessage('Quotation submitted for approval.');
  };

  const handleSaveDraft = () => {
    setToastMessage('Quotation draft saved successfully.');
  };

  return (
    <DashboardLayout>
      <div className="quotation-detail-page">

        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'fixed', bottom: '24px', right: '24px',
            backgroundColor: 'var(--blue-slate)', color: 'var(--white)',
            padding: '12px 24px', borderRadius: '8px', zIndex: 1000,
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}>
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <QuotationHeader
          quotation={quotation}
          onSaveDraft={handleSaveDraft}
          onSubmitApproval={handleSubmitApproval}
        />

        {/* Timeline */}
        <QuotationTimeline currentStage={quotation.stage} />

        {/* Two Column Layout */}
        <div className="qd-layout">

          {/* Left Column */}
          <div className="qd-left">
            <CustomerInfo customer={quotation.customer} />
            <QuotationDetails quotation={{ id: quotation.id, ...quotation.details }} />

            <LineItemsTable
              items={quotation.items}
              onOpenAddModal={() => setIsModalOpen(true)}
            />

            <InternalNotes />
          </div>

          {/* Right Column */}
          <div className="qd-right">
            <FinancialSummary items={quotation.items} />
            <DiscountAnalysis items={quotation.items} />
            <NextActionCard stage={quotation.stage} onSubmitApproval={handleSubmitApproval} />
            <ActivityHistory activities={quotation.activities} />
          </div>

        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </DashboardLayout>
  );
}
