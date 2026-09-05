import React, { useState } from 'react';
import authIllustration from '../assets/auth_illustration.png';
import { api } from '../services/api';

export default function AuthPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail, loginPassword) => {
    const e = (loginEmail !== undefined ? loginEmail : email).trim();
    const p = loginPassword !== undefined ? loginPassword : password;

    if (!e || !p) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.auth.login(e, p);
      if (res && res.token) {
        localStorage.setItem('dealflow-token', res.token);
        localStorage.setItem('dealflow-user', JSON.stringify(res.user));
        localStorage.setItem('dealflow-authenticated', 'true');
        if (onNavigate) onNavigate('dashboard');
      } else {
        // Dev fallback if token not returned directly
        localStorage.setItem('dealflow-authenticated', 'true');
        if (onNavigate) onNavigate('dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    handleLogin(demoEmail, demoPassword);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <img src={authIllustration} alt="Authentication Illustration" />
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h1 className="auth-title">Sign In to Your Account</h1>

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
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. atharva@dealflow360.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Write your password here"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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

          <div className="forgot-password-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Demo: password123</span>
            <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>Forgot password?</a>
          </div>

          {/* Quick Demo Sign-in Pills */}
          <div style={{ margin: '14px 0 6px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#718096', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Demo Logins:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('atharva@dealflow360.com', 'password123')}
                style={{
                  background: '#edf2f7',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#2d3748'
                }}
              >
                ⚡ Salesperson (Atharva)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager@dealflow360.com', 'password123')}
                style={{
                  background: '#edf2f7',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#2d3748'
                }}
              >
                ⚡ Sales Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@dealflow360.com', 'password123')}
                style={{
                  background: '#edf2f7',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#2d3748'
                }}
              >
                ⚡ Admin
              </button>
            </div>
          </div>

          <button
            className="auth-btn"
            disabled={loading}
            onClick={() => handleLogin()}
            style={{ marginTop: '12px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Authenticating...' : 'Continue'}
          </button>

          <div className="auth-footer">
            Don't have account? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('create-account'); }}>Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  );
}
