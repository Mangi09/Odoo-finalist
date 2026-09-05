import React from 'react';
import EcosystemIllustration from '../components/EcosystemIllustration';
import AuthForm from '../components/AuthForm';
import Logo from '../components/Logo';
import '../components/Auth.css';

export default function AuthPage() {
  return (
    <div className="auth-page">
      {/* Left Side: Brand & Ecosystem */}
      <div className="auth-left">
        <div className="brand-header">
          <Logo light />
          <span className="brand-label">CONNECTED DEAL ECOSYSTEM</span>
          <h1 className="brand-title">Every deal.<br />One intelligent flow.</h1>
          <p className="brand-desc">
            Connect sales, quotations, approvals, negotiations, fulfillment and payments in one intelligent workflow.
          </p>
        </div>
        <div className="ecosystem-wrapper">
          <EcosystemIllustration />
        </div>
      </div>

      {/* Right Side: Authentication */}
      <div className="auth-right">
        <AuthForm />
      </div>
    </div>
  );
}
