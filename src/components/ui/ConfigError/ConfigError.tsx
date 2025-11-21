/**
 * ConfigError Component
 * 
 * Display user-friendly error message when configuration fails to load
 */

import React from 'react';
import styles from './ConfigError.module.css';

export interface ConfigErrorProps {
  error?: Error | string;
  onRetry?: () => void;
}

const ConfigError: React.FC<ConfigErrorProps> = ({ error, onRetry }) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <svg
          className={styles.icon}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <h1 className={styles.title}>Configuration Error</h1>

        <p className={styles.message}>
          Failed to load application configuration. This may be due to missing
          environment variables or AWS configuration.
        </p>

        {errorMessage && (
          <details className={styles.details}>
            <summary className={styles.detailsSummary}>Technical Details</summary>
            <pre className={styles.errorText}>{errorMessage}</pre>
          </details>
        )}

        <div className={styles.actions}>
          <button onClick={handleRetry} className={styles.retryButton}>
            Retry
          </button>

          <a
            href="/login"
            className={styles.loginLink}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/login';
            }}
          >
            Go to Login
          </a>
        </div>

        <p className={styles.help}>
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};

export default ConfigError;
