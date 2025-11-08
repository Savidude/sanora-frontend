import React from 'react';
import { TeacherResponseProps, InitiationMessageData, ContinuationMessageData } from '../../types/chat';
import { InitiationMessage } from './TeacherFeedback/InitiationMessage';
import { ContinuationMessage } from './TeacherFeedback/ContinuationMessage';
import { ErrorBoundary } from './TeacherFeedback/ErrorBoundary';
import { useResponsive } from '../../hooks/useResponsive';
import { formatTime } from '../../utils/formatting';
import styles from './TeacherResponse.module.css';

export interface TeacherResponseComponentProps {
  response: TeacherResponseProps;
}

/**
 * New structured teacher response component
 * Routes between InitiationMessage and ContinuationMessage based on messageType
 */
export const TeacherResponse: React.FC<TeacherResponseComponentProps> = ({ response }) => {
  const { isMobile } = useResponsive();

  const timestamp = typeof response.timestamp === 'string'
    ? new Date(response.timestamp)
    : response.timestamp;

  return (
    <div className={styles.container}>
      <ErrorBoundary>
        {/* Route to appropriate message component */}
        {response.messageType === 'initiation' ? (
          <InitiationMessage 
            data={response.data as InitiationMessageData}
            timestamp={timestamp}
            isMobile={isMobile}
          />
        ) : (
          <ContinuationMessage 
            data={response.data as ContinuationMessageData}
            hasError={response.hasError}
            timestamp={timestamp}
            isMobile={isMobile}
          />
        )}
      </ErrorBoundary>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.timestamp}>{formatTime(timestamp)}</span>
        <span className={styles.messageType}>{response.messageType}</span>
      </div>
      
    </div>
  );
};
