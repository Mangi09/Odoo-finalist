import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';
import DealEcosystemIllustration from './DealEcosystemIllustration';

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-left">
        <span className="hero-eyebrow">DEAL LIFECYCLE MANAGEMENT</span>
        <h1 className="hero-title">
          From Quote to Payment — <br />
          <span>One Intelligent Flow.</span>
        </h1>
        <p className="hero-desc">
          Connect sales, quotations, approvals, negotiations, fulfillment, invoices and payments in one intelligent ecosystem.
        </p>
        
        <div className="hero-actions">
          <Link to="/login" className="btn-primary">Get Started <ArrowRight size={16} style={{ marginLeft: '8px' }} /></Link>
          <a href="#" className="btn-secondary demo-btn">
            <PlayCircle size={18} />
            Watch Demo
          </a>
        </div>
      </div>
      
      <div className="hero-right">
        <DealEcosystemIllustration />
      </div>
    </section>
  );
}
