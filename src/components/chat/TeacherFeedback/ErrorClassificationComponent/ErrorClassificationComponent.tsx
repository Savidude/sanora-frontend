import React from 'react';
import { ErrorType, ERROR_STYLES } from '../../../../types/chat';
import styles from './ErrorClassificationComponent.module.css';

export interface ErrorClassificationProps {
  classification: ErrorType;
  size?: 'small' | 'medium' | 'large';
}

export const ErrorClassificationComponent: React.FC<ErrorClassificationProps> = ({
  classification,
  size = 'medium'
}) => {
  const style = ERROR_STYLES[classification];
  
  return (
    <div 
      className={`${styles.errorClassification} ${styles[size]}`}
      style={{ 
        backgroundColor: style.backgroundColor,
        color: style.textColor,
        borderColor: style.borderColor
      }}
      role="status"
      aria-label={`Error classification: ${style.label}`}
    >
      <span className={styles.label}>{style.label}</span>
    </div>
  );
};
