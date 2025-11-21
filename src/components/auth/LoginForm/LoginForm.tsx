/**
 * LoginForm Component
 * 
 * Username/password authentication form with validation and error handling
 */

import React, { useState, FormEvent } from 'react';
import type { LoginCredentials } from '../../../types/auth';
import styles from './LoginForm.module.css';

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  initialUsername?: string;
  onForgotPassword?: () => void;
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  initialUsername = '',
  onForgotPassword,
  className = '',
}) => {
  const [username, setUsername] = useState<string>(initialUsername);
  const [password, setPassword] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  /**
   * Validate form inputs
   */
  const validate = (): boolean => {
    const errors: { username?: string; password?: string } = {};

    // Validate username
    if (!username.trim()) {
      errors.username = 'Username is required';
    }

    // Validate password (minimum 8 characters)
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    console.log('📝 Form submitted, preventing default...');
    e.preventDefault();
    console.log('✓ Default prevented');

    // Clear previous validation errors
    setValidationErrors({});

    // Validate inputs
    if (!validate()) {
      console.log('✗ Validation failed');
      return;
    }
    console.log('✓ Validation passed');

    // Submit credentials
    try {
      console.log('🚀 Calling onSubmit with credentials...');
      await onSubmit({ username, password });
      console.log('✓ onSubmit completed');
    } catch (err) {
      // Error handling is done by parent component
      console.error('✗ Login form submission error:', err);
    }
  };

  /**
   * Handle input change and clear validation errors
   */
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (validationErrors.username) {
      setValidationErrors({ ...validationErrors, username: undefined });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors({ ...validationErrors, password: undefined });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.loginForm} ${className}`}
      noValidate
    >
      <h2 className={styles.title}>Sign In</h2>

      {error && (
        <div className={styles.errorAlert} role="alert" aria-live="assertive">
          <svg
            className={styles.errorIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="username" className={styles.label}>
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={handleUsernameChange}
          disabled={loading}
          className={`${styles.input} ${
            validationErrors.username ? styles.inputError : ''
          }`}
          aria-invalid={!!validationErrors.username}
          aria-describedby={validationErrors.username ? 'username-error' : undefined}
        />
        {validationErrors.username && (
          <p id="username-error" className={styles.fieldError} role="alert">
            {validationErrors.username}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className={styles.forgotPassword}
              disabled={loading}
            >
              Forgot password?
            </button>
          )}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={handlePasswordChange}
          disabled={loading}
          className={`${styles.input} ${
            validationErrors.password ? styles.inputError : ''
          }`}
          aria-invalid={!!validationErrors.password}
          aria-describedby={validationErrors.password ? 'password-error' : undefined}
        />
        {validationErrors.password && (
          <p id="password-error" className={styles.fieldError} role="alert">
            {validationErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={styles.submitButton}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <svg
              className={styles.spinner}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className={styles.spinnerCircle}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className={styles.spinnerPath}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Signing In...</span>
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};

export default LoginForm;
