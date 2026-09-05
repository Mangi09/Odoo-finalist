import React from 'react';
import { Users, Truck, DollarSign, Target } from 'lucide-react';

export default function WhyDealFlowSection() {
  return (
    <section id="why-dealflow" className="landing-section">
      <div className="why-split">
        <div className="why-left">
          <h2 className="why-large-text">
            Stop managing deals in disconnected systems.
          </h2>
        </div>
        
        <div className="why-right-content">
          <p className="why-desc">
            Bring people, processes and deal data together in one intelligent ecosystem.
          </p>
          
          <div className="why-cards">
            <div className="why-card">
              <Target size={20} style={{ color: 'var(--blue-slate)' }} /> Sales
            </div>
            <div className="why-card">
              <Truck size={20} style={{ color: 'var(--light-coral)' }} /> Operations
            </div>
            <div className="why-card">
              <DollarSign size={20} style={{ color: '#10b981' }} /> Finance
            </div>
            <div className="why-card">
              <Users size={20} style={{ color: 'var(--dusty-mauve)' }} /> Customers
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
