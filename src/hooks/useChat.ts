import { useState, useCallback, useEffect, useRef } from 'react';
import { UserMessage, TeacherResponseProps } from '../types/chat';
import { chatService } from '../services/chatService';
import { generateSessionId } from '../utils/validation';
import { useLocalStorage } from './useLocalStorage';

export interface UseChatReturn {
  messages: UserMessage[];
  feedback: TeacherResponseProps[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  clearError: () => void;
  resetConversation: () => Promise<void>;
  sessionId: string;
}

export const useChat = (): UseChatReturn => {
  // Get or create session ID
  const [sessionId] = useLocalStorage<string>('sanora-session-id', generateSessionId());

  // Persistent storage for messages and feedback
  const [messages, setMessages] = useLocalStorage<UserMessage[]>('sanora-messages', []);
  const [feedback, setFeedback] = useLocalStorage<TeacherResponseProps[]>('sanora-feedback', []);

  // Transient UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference to track pending message
  const pendingMessageRef = useRef<UserMessage | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) return;

      // Create new user message
      const newMessage: UserMessage = {
        id: `msg-${Date.now()}`,
        content: trimmedContent,
        timestamp: new Date(),
        status: 'pending',
        sessionId,
      };

      // Add message to state
      setMessages(prev => [...prev, newMessage]);
      pendingMessageRef.current = newMessage;

      setIsLoading(true);
      setError(null);

      try {
        // Send to API
        const response = await chatService.sendMessage({
          message: trimmedContent,
          sessionId,
        });

        // Update message status to sent
        setMessages(prev =>
          prev.map(msg => (msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg))
        );

        // Map response to new teacher response structure and add to state
        const teacherResponse = chatService.mapApiResponseToTeacherResponse(response);
        setFeedback(prev => [...prev, teacherResponse]);

        pendingMessageRef.current = null;
      } catch (err) {
        // Update message status to error
        setMessages(prev =>
          prev.map(msg => (msg.id === newMessage.id ? { ...msg, status: 'error' } : msg))
        );

        setError(
          err instanceof Error ? err.message : 'Failed to send message. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, setMessages, setFeedback]
  );

  const retryMessage = useCallback(
    async (messageId: string) => {
      const message = messages.find(msg => msg.id === messageId);
      if (!message) return;

      // Remove the failed message and resend
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      await sendMessage(message.content);
    },
    [messages, sendMessage, setMessages]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetConversation = useCallback(async () => {
    try {
      // Cancel any pending operations
      if (pendingMessageRef.current) {
        pendingMessageRef.current = null;
      }

      // Clear loading and error states
      setIsLoading(false);
      setError(null);

      // Clear messages and feedback from state (this will also clear localStorage via useLocalStorage)
      setMessages([]);
      setFeedback([]);

      // Import conversationUtils dynamically to avoid circular dependencies
      const { conversationUtils } = await import('../utils/conversationUtils');

      // Clear all conversation data from localStorage
      await conversationUtils.clearConversationData();

      // Reset UI to initial state (this will reload the page)
      conversationUtils.resetConversationUI();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to reset conversation');
      setError(err.message);
      throw err;
    }
  }, [setMessages, setFeedback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pendingMessageRef.current = null;
    };
  }, []);

  return {
    messages,
    feedback,
    isLoading,
    error,
    sendMessage,
    retryMessage,
    clearError,
    resetConversation,
    sessionId,
  };
};
