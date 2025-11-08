import React from 'react';
import { UserMessage } from '../../types/chat';
import { formatTime } from '../../utils/formatting';
import styles from './MessageBubble.module.css';

export interface MessageBubbleProps {
  message: UserMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const statusIcon = {
    pending: '⏳',
    sent: '✓',
    error: '⚠️',
  }[message.status];

  // Handle timestamp as either Date object or string (from localStorage)
  const timestamp = typeof message.timestamp === 'string' 
    ? new Date(message.timestamp) 
    : message.timestamp;

  return (
    <div className={styles.container}>
      <div className={styles.bubble}>
        <p className={styles.content}>{message.content}</p>
        <div className={styles.footer}>
          <span className={styles.timestamp}>{formatTime(timestamp)}</span>
          <span className={`${styles.status} ${styles[message.status]}`} title={message.status}>
            {statusIcon}
          </span>
        </div>
      </div>
    </div>
  );
};
