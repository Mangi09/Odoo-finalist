import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import QuotationsPage from './pages/QuotationsPage';
import QuotationDetailPage from './pages/QuotationDetailPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import DealHealthPage from './pages/DealHealthPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LandingPage from './pages/LandingPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/quotations/:id" element={<QuotationDetailPage />} />
        <Route path="/invoices/:invoiceId" element={<InvoiceDetailPage />} />
        <Route path="/deal-health" element={<DealHealthPage />} />
        <Route path="/admin-reports" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
