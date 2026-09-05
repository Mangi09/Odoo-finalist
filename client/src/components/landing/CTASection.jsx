import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="cta-section">
      {/* Background visual elements */}
      <div className="cta-bg-line"></div>
      <div className="cta-bg-circle"></div>
      
      <div className="cta-content">
        <h2 className="landing-title" style={{ fontSize: '48px', marginBottom: '24px' }}>
          Ready to connect your entire deal flow?
        </h2>
        <p className="landing-subtitle text-center">
          From the first quote to the final payment, keep every stage connected and intelligent.
        </p>
        
        <div className="cta-actions">
          <Link to="/login" className="btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
            Get Started
          </Link>
          <a href="#" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Request Demo <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
