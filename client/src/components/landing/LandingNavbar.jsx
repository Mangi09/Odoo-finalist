import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function LandingNavbar() {
  return (
    <nav className="landing-nav">
      <Link to="/" className="landing-nav-logo">
        <Layers size={24} />
        DealFlow360
      </Link>
      
      <div className="landing-nav-links">
        <a href="#features" className="landing-nav-link">Features</a>
        <a href="#how-it-works" className="landing-nav-link">How It Works</a>
        <a href="#benefits" className="landing-nav-link">Benefits</a>
        <a href="#why-dealflow" className="landing-nav-link">Why DealFlow</a>
      </div>
      
      <div className="landing-nav-actions">
        <Link to="/login" className="btn-nav-login">Log in</Link>
        <Link to="/login" className="btn-primary nav-btn">Get Started</Link>
      </div>
    </nav>
  );
}
