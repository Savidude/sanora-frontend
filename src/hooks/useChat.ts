import { useState, useCallback, useEffect, useRef } from 'react';
import { UserMessage, TeacherFeedback } from '../types/chat';
import { chatService } from '../services/chatService';
import { generateSessionId } from '../utils/validation';
import { useLocalStorage } from './useLocalStorage';

export interface UseChatReturn {
  messages: UserMessage[];
  feedback: TeacherFeedback[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  clearError: () => void;
  sessionId: string;
}

export const useChat = (): UseChatReturn => {
  // Get or create session ID
  const [sessionId] = useLocalStorage<string>('sanora-session-id', generateSessionId());

  // Persistent storage for messages and feedback
  const [messages, setMessages] = useLocalStorage<UserMessage[]>('sanora-messages', []);
  const [feedback, setFeedback] = useLocalStorage<TeacherFeedback[]>('sanora-feedback', []);

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

        // Map response to feedback and add to state
        const teacherFeedback = chatService.mapResponseToFeedback(response);
        setFeedback(prev => [...prev, teacherFeedback]);

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
    sessionId,
  };
};
