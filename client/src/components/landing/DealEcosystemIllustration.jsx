import React from 'react';
import { Layers, FileText, CheckCircle, Truck, FileOutput, CreditCard, ShieldCheck } from 'lucide-react';

export default function DealEcosystemIllustration() {
  return (
    <div className="hero-illustration-container">
      {/* Background connecting lines */}
      <div className="eco-line" style={{ width: '300px', transform: 'rotate(30deg)' }}></div>
      <div className="eco-line" style={{ width: '300px', transform: 'rotate(150deg)' }}></div>
      <div className="eco-line" style={{ width: '300px', transform: 'rotate(90deg)' }}></div>
      
      {/* Central Hub */}
      <div className="eco-center-node">
        <div className="eco-center-logo">
          <Layers size={24} />
        </div>
        <span className="eco-center-text">DealFlow360</span>
      </div>

      {/* Floating Nodes */}
      <div className="eco-orbit-node" style={{ top: '10%', left: '10%', animationDelay: '0s' }}>
        <FileText size={16} className="eco-orbit-icon" /> Sales
      </div>
      
      <div className="eco-orbit-node" style={{ top: '15%', right: '5%', animationDelay: '1s' }}>
        <CheckCircle size={16} className="eco-orbit-icon" /> Quotation
      </div>
      
      <div className="eco-orbit-node" style={{ top: '45%', right: '-5%', animationDelay: '2s' }}>
        <ShieldCheck size={16} className="eco-orbit-icon" /> Approval
      </div>
      
      <div className="eco-orbit-node" style={{ bottom: '15%', right: '10%', animationDelay: '3s' }}>
        <Truck size={16} className="eco-orbit-icon" /> Fulfillment
      </div>
      
      <div className="eco-orbit-node" style={{ bottom: '5%', left: '20%', animationDelay: '4s' }}>
        <FileOutput size={16} className="eco-orbit-icon" /> Invoice
      </div>
      
      <div className="eco-orbit-node" style={{ top: '45%', left: '-5%', animationDelay: '5s' }}>
        <CreditCard size={16} className="eco-orbit-icon" /> Payment
      </div>
    </div>
  );
}
