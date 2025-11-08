# Quickstart Guide: Teacher Response Components

**Feature**: Teacher Response Components Implementation  
**Date**: 2025-11-09  
**For**: Developers implementing structured teacher feedback UI

## Overview

This guide walks through implementing specialized teacher response components that replace placeholder sections in the Sanora chat interface. Components handle two message types: initiation (greeting, scenario, prompt) and continuation (error feedback, corrections, conversation flow).

## Prerequisites

- Existing Sanora frontend codebase with React 18+, TypeScript 5+
- Current TeacherFeedback component and chat infrastructure
- API contract from `/specs/001-chat-interface/contracts/api.yaml`

## Implementation Steps

### 1. Update Type Definitions

**File**: `src/types/chat.ts`

Add new interfaces for teacher response components:

```typescript
// Add to existing chat.ts
export interface InitiationMessageData {
  greeting: string;
  scenario: string;
  conversationContinuation: string;
  wordTips: WordTip[];
}

export interface ContinuationMessageData {
  feedbackText?: string;
  errorDetails?: ErrorDetail;
  conversationContinuation: string;
  wordTips: WordTip[];
}

export interface TeacherResponseComponentProps {
  messageType: 'initiation' | 'feedback' | 'conclusion';
  hasError: 'YES' | 'NO' | 'MINOR';
  timestamp: Date;
  sessionId: string;
  data: InitiationMessageData | ContinuationMessageData;
}

// Error classification styling
export const ERROR_STYLES = {
  'YES': { backgroundColor: '#ef4444', label: 'Error' },
  'MINOR': { backgroundColor: '#f59e0b', label: 'Minor Error' },
  'NO': { backgroundColor: '#10b981', label: 'Correct' }
} as const;
```

### 2. Create Initiation Message Component

**File**: `src/components/chat/TeacherFeedback/InitiationMessage/InitiationMessage.tsx`

```typescript
import React from 'react';
import { InitiationMessageData, WordTip } from '../../../../types/chat';
import { WordTipsComponent } from '../WordTipsComponent';
import styles from './InitiationMessage.module.css';

interface InitiationMessageProps {
  data: InitiationMessageData;
  timestamp: Date;
  isMobile: boolean;
}

export const InitiationMessage: React.FC<InitiationMessageProps> = ({
  data,
  timestamp,
  isMobile
}) => {
  return (
    <div className={`${styles.container} ${isMobile ? styles.mobile : styles.desktop}`}>
      
      {/* Greeting Section */}
      <section className={styles.greetingSection}>
        <h3 className={styles.sectionTitle}>Greeting</h3>
        <p className={styles.greetingText}>
          {data.greeting || <span className={styles.fallback}>No data</span>}
        </p>
      </section>

      {/* Scenario Section */}
      <section className={styles.scenarioSection}>
        <h3 className={styles.sectionTitle}>Scenario</h3>
        <p className={styles.scenarioText}>
          {data.scenario || <span className={styles.fallback}>No data</span>}
        </p>
      </section>

      {/* Initial Prompt Section */}
      <section className={styles.promptSection}>
        <h3 className={styles.sectionTitle}>Let's Practice</h3>
        <div className={styles.promptText}>
          {data.conversationContinuation || <span className={styles.fallback}>No data</span>}
        </div>
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
```

### 3. Create Continuation Message Component

**File**: `src/components/chat/TeacherFeedback/ContinuationMessage/ContinuationMessage.tsx`

```typescript
import React from 'react';
import { ContinuationMessageData, ErrorType, ERROR_STYLES } from '../../../../types/chat';
import { WordTipsComponent } from '../WordTipsComponent';
import { ErrorClassificationComponent } from '../ErrorClassificationComponent';
import styles from './ContinuationMessage.module.css';

interface ContinuationMessageProps {
  data: ContinuationMessageData;
  hasError: ErrorType;
  timestamp: Date;
  isMobile: boolean;
}

export const ContinuationMessage: React.FC<ContinuationMessageProps> = ({
  data,
  hasError,
  timestamp,
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
        <section className={styles.feedbackSection}>
          <h3 className={styles.sectionTitle}>Feedback</h3>
          
          {data.errorDetails.userMistake && (
            <div className={styles.mistake}>
              <strong>Your response:</strong> {data.errorDetails.userMistake}
            </div>
          )}
          
          {data.errorDetails.corrections.length > 0 && (
            <div className={styles.corrections}>
              <strong>Suggestions:</strong>
              <ul>
                {data.errorDetails.corrections.map((correction, index) => (
                  <li key={index}>{correction}</li>
                ))}
              </ul>
            </div>
          )}
          
          {data.errorDetails.explanation && (
            <div className={styles.explanation}>
              <strong>Explanation:</strong> {data.errorDetails.explanation}
            </div>
          )}
        </section>
      )}

      {/* General Feedback Text */}
      {data.feedbackText && (
        <section className={styles.generalFeedback}>
          <p>{data.feedbackText}</p>
        </section>
      )}

      {/* Conversation Continuation */}
      <section className={styles.continuationSection}>
        <h3 className={styles.sectionTitle}>Continue the Conversation</h3>
        <div className={styles.continuationPrompt}>
          {data.conversationContinuation || <span className={styles.fallback}>No data</span>}
        </div>
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
```

### 4. Create Shared WordTips Component

**File**: `src/components/chat/TeacherFeedback/WordTipsComponent/WordTipsComponent.tsx`

```typescript
import React, { useState } from 'react';
import { WordTip } from '../../../../types/chat';
import styles from './WordTipsComponent.module.css';

interface WordTipsProps {
  tips: WordTip[];
  layout: 'card' | 'inline';
  maxVisible?: number;
}

export const WordTipsComponent: React.FC<WordTipsProps> = ({
  tips,
  layout = 'card',
  maxVisible = 6
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayTips = showAll ? tips : tips.slice(0, maxVisible);

  if (!tips.length) {
    return (
      <section className={styles.wordTipsSection}>
        <h3 className={styles.sectionTitle}>Word Tips</h3>
        <span className={styles.fallback}>No data</span>
      </section>
    );
  }

  return (
    <section className={styles.wordTipsSection}>
      <h3 className={styles.sectionTitle}>Word Tips</h3>
      
      <div className={`${styles.tipsContainer} ${styles[layout]}`}>
        {displayTips.map((tip, index) => (
          <div key={index} className={styles.tipCard}>
            <div className={styles.finnishWord}>{tip.finnish}</div>
            <div className={styles.englishTranslation}>{tip.english}</div>
          </div>
        ))}
      </div>

      {tips.length > maxVisible && (
        <button 
          className={styles.expandButton}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : `Show All (${tips.length})`}
        </button>
      )}
    </section>
  );
};
```

### 5. Create Error Classification Component

**File**: `src/components/chat/TeacherFeedback/ErrorClassificationComponent/ErrorClassificationComponent.tsx`

```typescript
import React from 'react';
import { ErrorType, ERROR_STYLES } from '../../../../types/chat';
import styles from './ErrorClassificationComponent.module.css';

interface ErrorClassificationProps {
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
      style={{ backgroundColor: style.backgroundColor }}
    >
      <span className={styles.label}>{style.label}</span>
    </div>
  );
};
```

### 6. Update Main TeacherFeedback Component

**File**: `src/components/chat/TeacherFeedback.tsx` (modify existing)

```typescript
import React from 'react';
import { TeacherFeedback as TeacherFeedbackType } from '../../types/chat';
import { InitiationMessage } from './TeacherFeedback/InitiationMessage/InitiationMessage';
import { ContinuationMessage } from './TeacherFeedback/ContinuationMessage/ContinuationMessage';
import { useResponsive } from '../../hooks/useResponsive';
import { formatTime } from '../../utils/formatting';
import styles from './TeacherFeedback.module.css';

export interface TeacherFeedbackProps {
  feedback: TeacherFeedbackType;
}

export const TeacherFeedback: React.FC<TeacherFeedbackProps> = ({ feedback }) => {
  const { isMobile } = useResponsive();

  const timestamp = typeof feedback.timestamp === 'string'
    ? new Date(feedback.timestamp)
    : feedback.timestamp;

  return (
    <div className={styles.container}>
      
      {/* Route to appropriate message component */}
      {feedback.messageType === 'initiation' ? (
        <InitiationMessage 
          data={feedback.data as InitiationMessageData}
          timestamp={timestamp}
          isMobile={isMobile}
        />
      ) : (
        <ContinuationMessage 
          data={feedback.data as ContinuationMessageData}
          hasError={feedback.hasError}
          timestamp={timestamp}
          isMobile={isMobile}
        />
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.timestamp}>{formatTime(timestamp)}</span>
        <span className={styles.messageType}>{feedback.messageType}</span>
      </div>
      
    </div>
  );
};
```

### 7. Update Chat Service

**File**: `src/services/chatService.ts` (modify existing)

Add mapping function for API response to component props:

```typescript
import { TutorResponseData, AgentResponse } from './types/apiTypes';
import { TeacherResponseComponentProps, InitiationMessageData, ContinuationMessageData } from '../types/chat';

export const mapApiResponseToTeacherResponse = (
  response: AgentResponse
): TeacherResponseComponentProps => {
  const { data, session_id, timestamp } = response;
  
  // Map API response to component structure
  const mappedData = data.message_type === 'initiation' 
    ? {
        greeting: data.greeting || '',
        scenario: data.scenario || '',
        conversationContinuation: data.conversation_continuation,
        wordTips: data.word_tips || []
      } as InitiationMessageData
    : {
        feedbackText: data.feedback_text,
        errorDetails: data.error_details,
        conversationContinuation: data.conversation_continuation,
        wordTips: data.word_tips || []
      } as ContinuationMessageData;

  return {
    messageType: data.message_type,
    hasError: data.has_error,
    timestamp: new Date(timestamp),
    sessionId: session_id,
    data: mappedData
  };
};
```

## CSS Module Structure

Create corresponding `.module.css` files for each component with mobile-first responsive design:

- Content sections prioritized first on mobile
- Card-style word tips with proper spacing
- Color-only error classification indicators
- Touch-friendly interaction areas (minimum 44px)

## Testing

1. **Unit Tests**: Test each component with mock data
2. **Integration Tests**: Verify API response mapping
3. **Responsive Tests**: Check mobile and desktop layouts
4. **Accessibility Tests**: Verify color contrast and screen reader support

## Next Steps

1. Implement CSS modules for styling
2. Add error boundary handling
3. Create comprehensive test suite
4. Integrate with existing chat state management
5. Test with real API responses

This quickstart provides the foundation for structured teacher response components that enhance the conversational learning experience while maintaining mobile-first responsive design.