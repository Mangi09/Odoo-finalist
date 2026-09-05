import React from 'react';
import { Zap, Eye, BarChart2 } from 'lucide-react';
import DealEcosystemIllustration from './DealEcosystemIllustration';

export default function BenefitsSection() {
  return (
    <section id="benefits" className="benefits-section">
      <div className="landing-section">
        <div className="benefits-grid">
          <div className="benefits-left">
            <h2 className="landing-title" style={{ marginBottom: '40px' }}>
              Built for faster, smarter business decisions.
            </h2>
            
            <div className="benefit-item">
              <Zap size={24} className="benefit-icon" />
              <div>
                <h3 className="benefit-title">Faster approvals</h3>
                <p className="benefit-desc">Automate your workflows and reduce bottlenecks so deals close faster.</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <Eye size={24} className="benefit-icon" style={{ color: 'var(--blue-slate)' }} />
              <div>
                <h3 className="benefit-title">Better deal visibility</h3>
                <p className="benefit-desc">Give sales, operations, and finance teams a single source of truth.</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <BarChart2 size={24} className="benefit-icon" style={{ color: 'var(--dusty-mauve)' }} />
              <div>
                <h3 className="benefit-title">Higher revenue intelligence</h3>
                <p className="benefit-desc">Detect stalled negotiations and anomalous discounts before they impact your bottom line.</p>
              </div>
            </div>
          </div>
          
          <div className="benefits-right">
            <div className="benefits-visual">
              <div style={{ transform: 'scale(0.8)' }}>
                <DealEcosystemIllustration />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
