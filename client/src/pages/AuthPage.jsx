import React, { useState } from 'react';
import authIllustration from '../assets/auth_illustration.png';

export default function AuthPage({ onNavigate }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-page">
      <div className="auth-left">
        <img src={authIllustration} alt="Authentication Illustration" />
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h1 className="auth-title">Sign In to Your Account</h1>

          <div className="auth-field">
            <label>Email Address</label>
            <input type="email" placeholder="Write your email address here" />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Write your password here"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <div className="forgot-password-row">
            <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>Forgot password?</a>
          </div>

          <div className="password-rules">
            
            <ul>
              <li>Least 8 characters</li>
              <li>Least one number (0-9) or symbol</li>
              <li>Lowercase (a-z) and uppercase (A-Z)</li>
            </ul>
          </div>

          <button
            className="auth-btn"
            onClick={() => onNavigate && onNavigate('dashboard')}
          >
            Continue
          </button>

          <div className="auth-footer">
            Don't have account? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('create-account'); }}>Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  );
}
