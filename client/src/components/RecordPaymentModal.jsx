import React, { useState } from 'react';

export default function RecordPaymentModal({ isOpen, onClose, invoice, totalPaid, onRecordPayment }) {
  const remainingBalance = invoice.amount - totalPaid;
  
  const [formData, setFormData] = useState({
    amount: remainingBalance,
    date: new Date().toISOString().split('T')[0],
    method: 'Bank Transfer',
    reference: '',
    notes: ''
  });
  
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validations
    if (formData.amount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    if (formData.amount > remainingBalance) {
      setError('Payment amount cannot exceed the remaining invoice balance.');
      return;
    }

    onRecordPayment({
      ...formData,
      amount: formData.amount // ensure it's a number
    });
    
    // Reset form
    setFormData({
      amount: remainingBalance - formData.amount, // Set to new remaining if modal re-opens
      date: new Date().toISOString().split('T')[0],
      method: 'Bank Transfer',
      reference: '',
      notes: ''
    });
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-header">Record Payment</h3>
        
        <div className="payment-modal-info">
          <div>
            <label>Invoice:</label>
            <span>{invoice.id}</span>
          </div>
          <div>
            <label>Customer:</label>
            <span>{invoice.customer}</span>
          </div>
          <div>
            <label>Total Amount:</label>
            <span>{formatCurrency(invoice.amount)}</span>
          </div>
          <div>
            <label>Remaining Balance:</label>
            <span>{formatCurrency(remainingBalance)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="info-grid" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label>Payment Amount (₹)</label>
              <input 
                type="number" 
                name="amount" 
                min="1"
                max={remainingBalance}
                required 
                value={formData.amount} 
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Payment Date</label>
              <input 
                type="date" 
                name="date" 
                required 
                value={formData.date} 
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select name="method" value={formData.method} onChange={handleChange} required>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reference Number</label>
              <input 
                type="text" 
                name="reference" 
                required 
                value={formData.reference} 
                onChange={handleChange}
                placeholder="e.g. TXN-123456"
              />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Optional Notes</label>
            <input 
              type="text" 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange}
              placeholder="Any additional information"
            />
          </div>

          {error && <div style={{ color: 'var(--light-coral-dark)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => { setError(''); onClose(); }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}
