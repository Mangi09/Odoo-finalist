import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--blue-slate)', textDecoration: 'none', fontWeight: 800, fontSize: '20px' }}>
            <Layers size={24} />
            DealFlow360
          </Link>
          <p>
            The enterprise deal lifecycle management platform that connects your entire business workflow into one intelligent ecosystem.
          </p>
        </div>
        
        <div className="footer-nav">
          <h4>Product</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#benefits">Benefits</a></li>
            <li><a href="#">Security</a></li>
          </ul>
        </div>
        
        <div className="footer-nav">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
            <li><Link to="/login">Log in</Link></li>
            <li><Link to="/login">Get Started</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} DealFlow360. All rights reserved.</span>
        <span>Built for Enterprise.</span>
      </div>
    </footer>
  );
}
