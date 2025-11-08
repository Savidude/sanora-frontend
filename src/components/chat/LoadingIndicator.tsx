import React from 'react';
import styles from './LoadingIndicator.module.css';

export interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'medium',
  text,
}) => {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={`${styles.spinner} ${styles[size]}`} aria-hidden="true">
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      {text && <span className={styles.text}>{text}</span>}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
