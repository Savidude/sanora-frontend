// Core chat entity types
export interface UserMessage {
  id: string;
  content: string;
  timestamp: Date;
  status: 'pending' | 'sent' | 'error';
  sessionId: string;
}

export interface TeacherFeedback {
  id: string;
  messageType: 'initiation' | 'feedback' | 'conclusion';
  hasError: 'YES' | 'NO' | 'MINOR';
  components: FeedbackComponent[];
  timestamp: Date;
  sessionId: string;
}

export interface FeedbackComponent {
  id: string;
  type: 'grammar' | 'vocabulary' | 'pronunciation' | 'context';
  content: string;
  borderColor: 'green' | 'yellow' | 'orange' | 'red';
  size: 'small' | 'medium' | 'large';
}

export interface ChatSession {
  sessionId: string;
  messages: UserMessage[];
  feedback: TeacherFeedback[];
  startTime: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface MessageInputState {
  value: string;
  charCount: number;
  isDisabled: boolean;
  showError: boolean;
  errorMessage: string;
}

export interface ChatUIState {
  messages: UserMessage[];
  feedback: TeacherFeedback[];
  input: MessageInputState;
  isLoading: boolean;
  error: string | null;
}

// Teacher Response Component Types
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

export interface WordTip {
  finnish: string;
  english: string;
}

export interface ErrorDetail {
  userMistake?: string;
  corrections: string[];
  explanation?: string;
}

export type ErrorType = 'YES' | 'NO' | 'MINOR';

export interface ErrorClassificationStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  label: string;
}

export const ERROR_STYLES: Record<ErrorType, ErrorClassificationStyle> = {
  'YES': {
    backgroundColor: '#ef4444',
    textColor: '#ffffff',
    borderColor: '#dc2626',
    label: 'Error'
  },
  'MINOR': {
    backgroundColor: '#f59e0b',
    textColor: '#ffffff',
    borderColor: '#d97706',
    label: 'Minor Error'
  },
  'NO': {
    backgroundColor: '#10b981',
    textColor: '#ffffff',
    borderColor: '#059669',
    label: 'Correct'
  }
};

export interface TeacherResponseProps {
  id: string;
  messageType: 'initiation' | 'feedback' | 'conclusion';
  hasError: ErrorType;
  timestamp: Date;
  sessionId: string;
  data: InitiationMessageData | ContinuationMessageData;
}
