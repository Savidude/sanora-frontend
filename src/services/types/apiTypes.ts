// API request and response types based on OpenAPI specification

export interface PromptRequest {
  message: string;
  sessionId: string;
}

export interface AgentResponse {
  success: boolean;
  data: TutorResponseData;
  session_id: string;
  timestamp: string;
}

export interface TutorResponseData {
  message_type: 'initiation' | 'feedback' | 'conclusion';
  has_error: 'YES' | 'NO' | 'MINOR';
  feedback_text?: string;
  error_details?: ErrorDetail;
  greeting?: string;
  scenario?: string;
  conversation_continuation: string;
  word_tips: WordTip[];
}

export interface ErrorDetail {
  user_mistake?: string;
  corrections: string[];
  explanation?: string;
}

export interface WordTip {
  finnish: string;
  english: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}
