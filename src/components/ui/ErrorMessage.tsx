import React from 'react';
import { Button } from './Button';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
  variant = 'error',
}) => {
  const iconMap = {
    error: '⚠️',
    warning: '⚡',
    info: 'ℹ️',
  };

  return (
    <div className={`${styles.container} ${styles[variant]}`} role="alert">
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          {iconMap[variant]}
        </span>
        <p className={styles.message}>{message}</p>
      </div>
      <div className={styles.actions}>
        {onRetry && (
          <Button size="small" onClick={onRetry} variant="primary">
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button size="small" onClick={onDismiss} variant="ghost">
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
};
