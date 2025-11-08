import React, { useState } from 'react';
import { Button } from '../ui/Button';
import styles from './MessageInput.module.css';
import { validateMessage, getRemainingChars } from '../../utils/validation';

export interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type your message in Finnish...',
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const remaining = getRemainingChars(value);
  const isOverLimit = remaining < 0;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateMessage(value);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid message');
      return;
    }

    onSend(value.trim());
    setValue('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift sends message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Shift+Enter adds new line (default behavior)
  };

  const canSend = value.trim().length > 0 && !isOverLimit && !disabled;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputWrapper}>
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`${styles.textarea} ${isOverLimit ? styles.error : ''}`}
          rows={3}
          aria-label="Message input"
          aria-describedby={error ? 'input-error' : 'char-count'}
        />
        <div className={styles.footer}>
          <span
            id="char-count"
            className={`${styles.charCount} ${isOverLimit ? styles.overLimit : ''}`}
          >
            {remaining} characters remaining
          </span>
          {error && (
            <span id="input-error" className={styles.errorText} role="alert">
              {error}
            </span>
          )}
        </div>
      </div>
      <Button
        type="submit"
        disabled={!canSend}
        icon={<ArrowIcon />}
        iconPosition="right"
        aria-label="Send message"
      >
        Send
      </Button>
    </form>
  );
};

// Simple arrow icon component
const ArrowIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M8 2L14 8L8 14M14 8H2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
