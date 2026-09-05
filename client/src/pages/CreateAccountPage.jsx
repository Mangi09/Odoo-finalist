import React, { useState } from 'react';
import authIllustration from '../assets/create_account.png';

export default function CreateAccountPage({ onNavigate }) {
  const [role, setRole] = useState('Salesperson');
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  return (
    <div className="auth-page create-account-page">
      <div className="auth-left">
        <img src={authIllustration} alt="Authentication Illustration" />
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h1 className="auth-title">Create Account</h1>

          <div className="auth-field">
            <label>Full Name</label>
            <input type="text" placeholder="Write your full name here" />
          </div>

          <div className="auth-field">
            <label>Email Address</label>
            <input type="email" placeholder="Write your email here" />
          </div>

          <div className="auth-field">
            <label>Role</label>
            <div className="select-wrapper">
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Salesperson">Salesperson</option>
                <option value="Sales Manager">Sales Manager</option>
                <option value="Finance / Operations">Finance / Operations</option>
                <option value="Customer">Customer</option>
                <option value="Admin">Admin</option>
              </select>
              <span className="select-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••••"
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

          <div className="auth-field">
            <label>Re-type Password</label>
            <div className="input-wrapper">
              <input
                type={showRetypePassword ? 'text' : 'password'}
                placeholder="••••••••••••••"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowRetypePassword(!showRetypePassword)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <div className="password-rules">
            <div className="password-strength">
              <div className="strength-bar active"></div>
              <div className="strength-bar active"></div>
              <div className="strength-bar"></div>
              <div className="strength-bar"></div>
            </div>
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
            Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('auth'); }}>Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
