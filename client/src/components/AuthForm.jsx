import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Logo from './Logo';
import './Auth.css';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error on type
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email.';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Full name is required.';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Simulate successful auth
      navigate('/dashboard');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <Logo />
        <span className="auth-label">{isLogin ? 'LOGIN MODE' : 'GET STARTED'}</span>
        <h1 className="auth-title">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Sign in to continue managing your deal lifecycle.' 
            : 'Start managing your complete deal lifecycle.'}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              placeholder="Jane Doe"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">{isLogin ? 'Email Address' : 'Work Email'}</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange}
            placeholder="you@company.com"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange}
              placeholder="••••••••"
              className={errors.password ? 'input-error' : ''}
            />
            <button 
              type="button" 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        {!isLogin && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange}
              placeholder="••••••••"
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>
        )}

        {isLogin && (
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>Forgot password?</a>
          </div>
        )}

        <button type="submit" className="btn-primary">
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="auth-divider">
        <span>OR</span>
      </div>

      <div className="auth-switch">
        <span>{isLogin ? 'New to DealFlow360?' : 'Already have an account?'}</span>
        <button type="button" className="btn-link" onClick={toggleMode}>
          {isLogin ? 'Create an account' : 'Sign in'}
        </button>
      </div>
    </div>
  );
}
