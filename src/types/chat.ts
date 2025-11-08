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
