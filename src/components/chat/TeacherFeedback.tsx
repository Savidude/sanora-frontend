import React from 'react';
import { TeacherFeedback as TeacherFeedbackType, FeedbackComponent } from '../../types/chat';
import { useResponsive } from '../../hooks/useResponsive';
import { formatTime } from '../../utils/formatting';
import styles from './TeacherFeedback.module.css';

export interface TeacherFeedbackProps {
  feedback: TeacherFeedbackType;
}

export const TeacherFeedback: React.FC<TeacherFeedbackProps> = ({ feedback }) => {
  const { isMobile } = useResponsive();

  // Handle timestamp as either Date object or string (from localStorage)
  const timestamp = typeof feedback.timestamp === 'string'
    ? new Date(feedback.timestamp)
    : feedback.timestamp;

  return (
    <div className={styles.container}>
      <div className={`${styles.feedbackGrid} ${isMobile ? styles.mobile : styles.desktop}`}>
        {feedback.components.map((component, index) => (
          <React.Fragment key={component.id}>
            <FeedbackSquare component={component} />
            {index < feedback.components.length - 1 && (
              <div className={styles.divider} aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className={styles.footer}>
        <span className={styles.timestamp}>{formatTime(timestamp)}</span>
        <span className={styles.messageType}>{feedback.messageType}</span>
      </div>
    </div>
  );
};

interface FeedbackSquareProps {
  component: FeedbackComponent;
}

const FeedbackSquare: React.FC<FeedbackSquareProps> = ({ component }) => {
  const borderColorMap = {
    green: 'var(--color-success-green)',
    yellow: 'var(--color-warning-yellow)',
    orange: 'var(--color-alert-orange)',
    red: 'var(--color-error-red)',
  };

  const hasContent = component.content.trim().length > 0;

  return (
    <div
      className={`${styles.feedbackSquare} ${styles[component.size]}`}
      style={{ borderColor: borderColorMap[component.borderColor] }}
      role="article"
      aria-label={`${component.type} feedback`}
    >
      <div className={styles.squareHeader}>
        <span className={styles.componentType}>{component.type}</span>
        <span
          className={styles.colorIndicator}
          style={{ backgroundColor: borderColorMap[component.borderColor] }}
          aria-label={`${component.borderColor} indicator`}
        />
      </div>
      <div className={styles.squareContent}>
        {hasContent ? (
          <p className={styles.contentText}>{component.content}</p>
        ) : (
          <p className={styles.placeholderText}>No feedback for this aspect</p>
        )}
      </div>
    </div>
  );
};
