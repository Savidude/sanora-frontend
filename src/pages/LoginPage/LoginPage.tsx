/**
 * LoginPage Component
 * 
 * Authentication page that integrates LoginForm with authentication logic
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from '../../components/auth/LoginForm/LoginForm';
import type { LoginCredentials } from '../../types/auth';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, error } = useAuth();

  // Get the intended destination (where user wanted to go before redirect)
  const from = (location.state as any)?.from?.pathname || '/';

  /**
   * Redirect to intended destination if already authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✓ User authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  /**
   * Handle login form submission
   */
  const handleLogin = async (credentials: LoginCredentials) => {
    console.log('🔐 handleLogin called with username:', credentials.username);
    try {
      await login(credentials);
      console.log('✓ login() completed successfully');
      // Navigate immediately after successful login
      console.log('📍 Navigating to:', from);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by useAuth and displayed in LoginForm
      console.error('✗ Login failed in handleLogin:', err);
    }
  };

  /**
   * Handle forgot password (placeholder)
   */
  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    console.log('Forgot password clicked');
    alert('Password reset functionality coming soon!');
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.appTitle}>Sanora</h1>
          <p className={styles.subtitle}>Finnish Language Learning</p>
        </div>

        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
          onForgotPassword={handleForgotPassword}
          className={styles.loginForm}
        />

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{' '}
            <button
              type="button"
              className={styles.signupLink}
              onClick={() => alert('Sign up functionality coming soon!')}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
