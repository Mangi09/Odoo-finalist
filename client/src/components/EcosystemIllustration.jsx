import React from 'react';
import { Users, BriefcaseBusiness, FileText, ShieldCheck, PackageCheck, CreditCard } from 'lucide-react';
import './Auth.css';

export default function EcosystemIllustration() {
  const nodes = [
    { id: 'customer', icon: Users, label: 'CUSTOMER', pos: { top: '15%', left: '15%' } },
    { id: 'sales', icon: BriefcaseBusiness, label: 'SALES', pos: { top: '10%', right: '15%' } },
    { id: 'quotation', icon: FileText, label: 'QUOTATION', pos: { top: '40%', right: '5%' } },
    { id: 'approval', icon: ShieldCheck, label: 'APPROVAL', pos: { bottom: '20%', right: '10%' } },
    { id: 'fulfillment', icon: PackageCheck, label: 'FULFILLMENT', pos: { bottom: '15%', left: '20%' } },
    { id: 'payment', icon: CreditCard, label: 'PAYMENT', pos: { top: '45%', left: '5%' } },
  ];

  return (
    <div className="ecosystem-container">
      {/* SVG Connecting lines */}
      <svg className="ecosystem-lines" preserveAspectRatio="xMidYMid meet">
        {/* Simplified pseudo-random connections to center */}
        <line x1="20%" y1="20%" x2="50%" y2="50%" />
        <line x1="80%" y1="15%" x2="50%" y2="50%" />
        <line x1="90%" y1="45%" x2="50%" y2="50%" />
        <line x1="85%" y1="80%" x2="50%" y2="50%" />
        <line x1="25%" y1="80%" x2="50%" y2="50%" />
        <line x1="10%" y1="50%" x2="50%" y2="50%" />
      </svg>

      {/* Main Central Node */}
      <div className="center-node">
        <div className="center-node-content">
          <div className="center-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M8 11l3 3 5-5" /></svg>
          </div>
          <h3>DealFlow360</h3>
          <p>Connected Deal Lifecycle</p>
        </div>
      </div>

      {/* Perimeter Nodes */}
      {nodes.map((node) => {
        const Icon = node.icon;
        return (
          <div key={node.id} className="eco-node" style={{ ...node.pos }}>
            <div className="eco-node-icon">
              <Icon size={20} />
            </div>
            <span className="eco-node-label">{node.label}</span>
          </div>
        );
      })}
    </div>
  );
}
