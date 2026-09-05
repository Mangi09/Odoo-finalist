import React, { useState } from 'react';

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [formData, setFormData] = useState({
    product: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'product' || name === 'description' ? value : Number(value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProduct(formData);
    setFormData({ product: '', description: '', quantity: 1, unitPrice: 0, discountPercent: 0 }); // reset
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-header">Add Product</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Product Name</label>
            <input 
              type="text" 
              name="product" 
              required 
              value={formData.product} 
              onChange={handleChange}
              placeholder="e.g. Enterprise Analytics Suite"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Description</label>
            <input 
              type="text" 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              placeholder="Optional description"
            />
          </div>
          <div className="info-grid">
            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                name="quantity" 
                min="1" 
                required 
                value={formData.quantity} 
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Unit Price (₹)</label>
              <input 
                type="number" 
                name="unitPrice" 
                min="0" 
                required 
                value={formData.unitPrice} 
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Discount (%)</label>
              <input 
                type="number" 
                name="discountPercent" 
                min="0" 
                max="100" 
                value={formData.discountPercent} 
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Add Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
