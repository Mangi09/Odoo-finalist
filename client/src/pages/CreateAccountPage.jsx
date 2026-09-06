import React, { useState } from 'react';
import authIllustration from '../assets/create_account.png';
import { api } from '../services/api';

export default function CreateAccountPage({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('salesperson');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== retypePassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let backendRole = 'salesperson';
      if (role === 'manager') backendRole = 'sales_manager';
      else if (role === 'admin') backendRole = 'admin';
      else if (role === 'customer') backendRole = 'customer';

      const res = await api.auth.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: backendRole,
      });

      if (res && res.token) {
        localStorage.setItem('dealflow-token', res.token);
        localStorage.setItem('dealflow-user', JSON.stringify(res.user));
        localStorage.setItem('dealflow-authenticated', 'true');
        if (onNavigate) onNavigate('dashboard');
      } else {
        localStorage.setItem('dealflow-authenticated', 'true');
        if (onNavigate) onNavigate('dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page create-account-page">
      <div className="auth-left">
        <img src={authIllustration} alt="Authentication Illustration" />
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h1 className="auth-title">Create Account</h1>

          {error && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid #feb2b2',
              color: '#c53030',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <div className="auth-field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Atharva Ketkar"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Write your email here"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Role</label>
            <div className="select-wrapper">
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="salesperson">Salesperson</option>
                <option value="manager">Sales Manager</option>
                <option value="admin">Admin / Operations</option>
                <option value="customer">Customer</option>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowRetypePassword(!showRetypePassword)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <div className="password-rules">
            <div className="password-strength">
              <div className="strength-bar active"></div>
              <div className="strength-bar active"></div>
              <div className={`strength-bar ${password.length >= 8 ? 'active' : ''}`}></div>
              <div className={`strength-bar ${password.length >= 10 ? 'active' : ''}`}></div>
            </div>
            <ul>
              <li>Least 8 characters</li>
              <li>Least one number (0-9) or symbol</li>
              <li>Lowercase (a-z) and uppercase (A-Z)</li>
            </ul>
          </div>

          <button
            className="auth-btn"
            disabled={loading}
            onClick={handleRegister}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>

          <div className="auth-footer">
            Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('auth'); }}>Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
