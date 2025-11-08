import React, { useRef, useEffect } from 'react';
import { MessageInput } from './MessageInput';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import { TeacherResponse } from './TeacherResponse';
import { UserMessage, TeacherResponseProps } from '../../types/chat';
import styles from './ChatInterface.module.css';

export interface ChatInterfaceProps {
  messages: UserMessage[];
  feedback: TeacherResponseProps[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  feedback,
  onSendMessage,
  isLoading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastFeedbackRef = useRef<HTMLDivElement>(null);
  const previousFeedbackCount = useRef(feedback.length);
  const previousMessageCount = useRef(messages.length);

  // Scroll to bottom when user sends a message
  useEffect(() => {
    if (messages.length > previousMessageCount.current && messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
    previousMessageCount.current = messages.length;
  }, [messages]);

  // Scroll to top of new feedback when it arrives
  useEffect(() => {
    // Only scroll when new feedback is added
    if (feedback.length > previousFeedbackCount.current && lastFeedbackRef.current) {
      lastFeedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    previousFeedbackCount.current = feedback.length;
  }, [feedback]);

  const hasMessages = messages.length > 0 || feedback.length > 0;

  // Interleave messages and feedback chronologically
  const renderConversation = () => {
    const items: Array<{ type: 'message' | 'feedback'; data: UserMessage | TeacherResponseProps }> =
      [];

    messages.forEach(msg => {
      items.push({ type: 'message', data: msg });
    });

    feedback.forEach(fb => {
      items.push({ type: 'feedback', data: fb });
    });

    // Sort by timestamp (handle both Date objects and date strings from localStorage)
    items.sort((a, b) => {
      const timeA = typeof a.data.timestamp === 'string' 
        ? new Date(a.data.timestamp).getTime() 
        : a.data.timestamp.getTime();
      const timeB = typeof b.data.timestamp === 'string'
        ? new Date(b.data.timestamp).getTime()
        : b.data.timestamp.getTime();
      return timeA - timeB;
    });

    return items.map((item, index) => {
      if (item.type === 'message') {
        const message = item.data as UserMessage;
        return <MessageBubble key={`msg-${message.id}-${index}`} message={message} />;
      } else {
        const responseData = item.data as TeacherResponseProps;
        const isLastFeedback = index === items.length - 1 && item.type === 'feedback';
        return (
          <div key={`teacher-${responseData.id}-${index}`} ref={isLastFeedback ? lastFeedbackRef : null}>
            <TeacherResponse response={responseData} />
          </div>
        );
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.messagesContainer}>
        {!hasMessages && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Start a conversation in Finnish!</p>
            <p className={styles.emptySubtext}>
              Send a message to begin practicing with your tutor.
            </p>
          </div>
        )}
        {renderConversation()}
        {isLoading && <LoadingIndicator text="Teacher is typing..." />}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput
        onSend={onSendMessage}
        disabled={isLoading}
        placeholder="Type your message in Finnish..."
      />
    </div>
  );
};
