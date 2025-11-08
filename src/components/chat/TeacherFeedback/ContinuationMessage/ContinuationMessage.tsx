import React from 'react';
import { ContinuationMessageData, ErrorType } from '../../../../types/chat';
import { WordTipsComponent } from '../WordTipsComponent';
import { ErrorClassificationComponent } from '../ErrorClassificationComponent';
import { renderMarkdown } from '../../../../utils/markdown';
import styles from './ContinuationMessage.module.css';

export interface ContinuationMessageProps {
  data: ContinuationMessageData;
  hasError: ErrorType;
  timestamp: Date;
  isMobile: boolean;
}

export const ContinuationMessage: React.FC<ContinuationMessageProps> = ({
  data,
  hasError,
  isMobile
}) => {
  return (
    <div className={`${styles.container} ${isMobile ? styles.mobile : styles.desktop}`}>
      
      {/* Error Classification Section */}
      <ErrorClassificationComponent 
        classification={hasError}
        size={isMobile ? 'large' : 'medium'}
      />

      {/* Feedback Details Section */}
      {data.errorDetails && (
        <section className={styles.feedbackSection} aria-label="Feedback details">
          <h3 className={styles.sectionTitle}>Feedback</h3>
          
          {data.errorDetails.userMistake && (
            <div className={styles.mistake}>
              <strong className={styles.mistakeLabel}>Your response:</strong>
              <p className={styles.mistakeText} lang="fi">{data.errorDetails.userMistake}</p>
            </div>
          )}
          
          {data.errorDetails.corrections && data.errorDetails.corrections.length > 0 && (
            <div className={styles.corrections}>
              <strong className={styles.correctionsLabel}>Suggestions:</strong>
              <ul className={styles.correctionsList}>
                {data.errorDetails.corrections.map((correction, index) => (
                  <li key={index} className={styles.correctionItem} lang="fi">
                    {correction}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {data.errorDetails.explanation && (
            <div className={styles.explanation}>
              <strong className={styles.explanationLabel}>Explanation:</strong>
              <p className={styles.explanationText}>{renderMarkdown(data.errorDetails.explanation)}</p>
            </div>
          )}
        </section>
      )}

      {/* General Feedback Text - Only show when there's no error */}
      {data.feedbackText && hasError === 'NO' && (
        <section className={styles.generalFeedback} aria-label="General feedback">
          <p className={styles.feedbackText}>{renderMarkdown(data.feedbackText)}</p>
        </section>
      )}

      {/* Conversation Continuation */}
      <section className={styles.continuationSection} aria-label="Continue the conversation">
        <h3 className={styles.sectionTitle}>Continue the Conversation</h3>
        {data.conversationContinuation ? (
          <div className={styles.continuationPrompt}>
            {renderMarkdown(data.conversationContinuation)}
          </div>
        ) : (
          <span className={styles.fallback}>No data</span>
        )}
      </section>

      {/* Word Tips Section */}
      <WordTipsComponent 
        tips={data.wordTips || []}
        layout="card"
        maxVisible={6}
      />
      
    </div>
  );
};
