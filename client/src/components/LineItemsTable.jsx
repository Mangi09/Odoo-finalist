import React from 'react';
import { Package, Plus } from 'lucide-react';

export default function LineItemsTable({ items, onOpenAddModal }) {
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="qd-card">
      <div className="qd-card-header">
        <Package size={18} />
        Products & Services
      </div>
      
      <div className="line-items-wrapper">
        <table className="line-items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th className="text-right">Quantity</th>
              <th className="text-right">Unit Price</th>
              <th className="text-right">Discount</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const itemTotal = (item.quantity * item.unitPrice) * (1 - item.discountPercent / 100);
              return (
                <tr key={index}>
                  <td className="product-cell">
                    <span className="product-name">{item.product}</span>
                    <span className="product-desc">{item.description}</span>
                  </td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-right">{item.discountPercent}%</td>
                  <td className="text-right" style={{ fontWeight: 600 }}>{formatCurrency(itemTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className="add-product-row">
          <button className="btn-dashed" onClick={onOpenAddModal}>
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
