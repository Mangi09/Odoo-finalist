import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import InvoiceHeader from '../components/InvoiceHeader';
import InvoiceLifecycle from '../components/InvoiceLifecycle';
import InvoiceInformation from '../components/InvoiceInformation';
import LinkedDealCard from '../components/LinkedDealCard';
import AlertPanel from '../components/AlertPanel';
import PaymentProgress from '../components/PaymentProgress';
import PaymentHistory from '../components/PaymentHistory';
import InvoiceActivity from '../components/InvoiceActivity';
import RecordPaymentModal from '../components/RecordPaymentModal';
import '../components/InvoiceDetail.css';

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams();
  const displayId = invoiceId || 'INV-1042';

  // Initial Mock Data
  const initialInvoice = {
    id: displayId,
    customer: 'Acme Corporation',
    linkedDeal: 'Q-1042',
    amount: 480000,
    invoiceDate: '10 Sep 2026',
    dueDate: '18 Sep 2026',
    status: 'Emailed',
    paymentTerms: 'Net 30'
  };

  const initialActivities = [
    { title: 'Invoice created', time: 'Sep 10, 2026 — 10:15 AM' },
    { title: 'Invoice posted', time: 'Sep 10, 2026 — 10:30 AM' },
    { title: 'Invoice emailed to customer', time: 'Sep 11, 2026 — 09:20 AM' }
  ];

  const [invoice, setInvoice] = useState(initialInvoice);
  const [payments, setPayments] = useState([]);
  const [activities, setActivities] = useState(initialActivities);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleRecordPayment = (paymentData) => {
    const newPayment = {
      id: Date.now(),
      ...paymentData,
      recordedBy: 'Alex Morgan' // Mock logged in user
    };
    
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);

    const newTotalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    
    let newStatus = invoice.status;
    if (newTotalPaid >= invoice.amount) {
      newStatus = 'Paid';
    } else if (newTotalPaid > 0) {
      newStatus = 'Partially Paid';
    }

    setInvoice(prev => ({
      ...prev,
      status: newStatus
    }));

    const now = new Date();
    const timeString = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' })}`;

    setActivities(prev => [
      ...prev,
      { title: `Payment recorded (₹${paymentData.amount.toLocaleString('en-IN')}) via ${paymentData.method}`, time: timeString }
    ]);

    if (newStatus === 'Paid') {
       setActivities(prev => [
         ...prev,
         { title: 'Invoice fully paid', time: timeString }
       ]);
    }

    setToastMessage('Payment recorded successfully.');
  };

  const handleDownload = () => {
    setToastMessage('Invoice downloaded successfully.');
  };

  return (
    <DashboardLayout>
      <div className="invoice-detail-page">
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

        <InvoiceHeader 
          invoice={invoice} 
          onRecordPayment={() => setIsModalOpen(true)}
          onDownload={handleDownload}
        />

        <InvoiceLifecycle currentStage={invoice.status} />

        <InvoiceInformation invoice={invoice} />

        <div style={{ margin: '8px 0' }}>
          <AlertPanel />
        </div>

        <div className="inv-content-grid">
          {/* Left Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PaymentProgress totalPaid={totalPaid} totalAmount={invoice.amount} />
            <PaymentHistory payments={payments} />
          </div>

          {/* Right Sidebar Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <LinkedDealCard linkedDeal={invoice.linkedDeal} />
            <InvoiceActivity activities={activities} />
          </div>
        </div>
      </div>

      <RecordPaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoice={invoice}
        totalPaid={totalPaid}
        onRecordPayment={handleRecordPayment}
      />
    </DashboardLayout>
  );
}
