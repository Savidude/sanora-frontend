import apiClient from './api';
import { PromptRequest, AgentResponse, TutorResponseData } from './types/apiTypes';
import { TeacherFeedback, FeedbackComponent, TeacherResponseProps, InitiationMessageData, ContinuationMessageData } from '../types/chat';

/**
 * Send a message to the chat API and receive teacher feedback
 */
export const sendMessage = async (request: PromptRequest): Promise<AgentResponse> => {
  try {
    const response = await apiClient.post<AgentResponse>(
      '/api/v1/chat/message', 
      request,
      { timeout: 60000 } // 60 seconds for AI processing
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to send message to server');
  }
};

/**
 * Map API response to TeacherFeedback entity
 */
export const mapResponseToFeedback = (response: AgentResponse): TeacherFeedback => {
  const data = response.data;
  
  // Create 4 feedback components based on response data
  const components: FeedbackComponent[] = createFeedbackComponents(data);

  return {
    id: `feedback-${Date.now()}`,
    messageType: data.message_type,
    hasError: data.has_error,
    components,
    timestamp: new Date(response.timestamp),
    sessionId: response.session_id,
  };
};

/**
 * Create 4 feedback components from API response data
 * Maps different parts of the response to the 4 visual components
 */
const createFeedbackComponents = (data: TutorResponseData): FeedbackComponent[] => {
  const components: FeedbackComponent[] = [];

  // Component 1: Feedback text (grammar focus)
  components.push({
    id: 'comp-1',
    type: 'grammar',
    content: data.feedback_text || data.conversation_continuation,
    borderColor: getBorderColor(data.has_error, 0),
    size: 'medium',
  });

  // Component 2: Error details or corrections (vocabulary focus)
  const errorContent = data.error_details
    ? `${data.error_details.user_mistake || ''}\n${data.error_details.corrections.join(', ')}`
    : '';
  components.push({
    id: 'comp-2',
    type: 'vocabulary',
    content: errorContent || data.error_details?.explanation || '',
    borderColor: getBorderColor(data.has_error, 1),
    size: 'medium',
  });

  // Component 3: Word tips (pronunciation focus)
  const wordTipsContent = data.word_tips.length > 0
    ? data.word_tips.map(tip => `${tip.finnish} - ${tip.english}`).join('\n')
    : '';
  components.push({
    id: 'comp-3',
    type: 'pronunciation',
    content: wordTipsContent,
    borderColor: getBorderColor(data.has_error, 2),
    size: 'medium',
  });

  // Component 4: Greeting/Scenario/Continuation (context focus)
  const contextContent = data.greeting || data.scenario || data.conversation_continuation;
  components.push({
    id: 'comp-4',
    type: 'context',
    content: contextContent,
    borderColor: getBorderColor(data.has_error, 3),
    size: 'medium',
  });

  return components;
};

/**
 * Determine border color based on error type and component index
 */
const getBorderColor = (
  hasError: 'YES' | 'NO' | 'MINOR',
  index: number
): 'green' | 'yellow' | 'orange' | 'red' => {
  if (hasError === 'YES') {
    return index === 0 ? 'red' : index === 1 ? 'orange' : index === 2 ? 'yellow' : 'green';
  } else if (hasError === 'MINOR') {
    return index === 0 ? 'orange' : index === 1 ? 'yellow' : 'green';
  } else {
    return 'green'; // NO errors - all green
  }
};

/**
 * Map API response to new TeacherResponseProps structure for structured components
 */
export const mapApiResponseToTeacherResponse = (
  response: AgentResponse
): TeacherResponseProps => {
  const { data, session_id, timestamp } = response;
  
  // Map API response to component structure based on message type
  const mappedData = data.message_type === 'initiation' 
    ? {
        greeting: data.greeting || '',
        scenario: data.scenario || '',
        conversationContinuation: data.conversation_continuation,
        wordTips: data.word_tips || []
      } as InitiationMessageData
    : {
        feedbackText: data.feedback_text,
        errorDetails: data.error_details ? {
          userMistake: data.error_details.user_mistake,
          corrections: data.error_details.corrections,
          explanation: data.error_details.explanation
        } : undefined,
        conversationContinuation: data.conversation_continuation,
        wordTips: data.word_tips || []
      } as ContinuationMessageData;

  return {
    id: `teacher-response-${Date.now()}`,
    messageType: data.message_type,
    hasError: data.has_error,
    timestamp: new Date(timestamp),
    sessionId: session_id,
    data: mappedData
  };
};

export const chatService = {
  sendMessage,
  mapResponseToFeedback,
  mapApiResponseToTeacherResponse,
};
