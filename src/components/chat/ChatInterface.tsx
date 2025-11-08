import React, { useRef, useEffect } from 'react';
import { MessageInput } from './MessageInput';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import { TeacherFeedback as TeacherFeedbackComponent } from './TeacherFeedback';
import { UserMessage, TeacherFeedback } from '../../types/chat';
import styles from './ChatInterface.module.css';

export interface ChatInterfaceProps {
  messages: UserMessage[];
  feedback: TeacherFeedback[];
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, feedback]);

  const hasMessages = messages.length > 0 || feedback.length > 0;

  // Interleave messages and feedback chronologically
  const renderConversation = () => {
    const items: Array<{ type: 'message' | 'feedback'; data: UserMessage | TeacherFeedback }> =
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
        const feedbackData = item.data as TeacherFeedback;
        return <TeacherFeedbackComponent key={`fb-${feedbackData.id}-${index}`} feedback={feedbackData} />;
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
