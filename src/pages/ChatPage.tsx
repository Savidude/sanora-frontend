import React from 'react';
import { ChatLayout } from '../components/layout/ChatLayout';
import { ChatInterface } from '../components/chat/ChatInterface';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useChat } from '../hooks/useChat';

export const ChatPage: React.FC = () => {
  const { messages, feedback, isLoading, error, sendMessage, clearError } = useChat();

  return (
    <ChatLayout>
      {error && (
        <div style={{ padding: '1rem' }}>
          <ErrorMessage message={error} onDismiss={clearError} variant="error" />
        </div>
      )}
      <ChatInterface
        messages={messages}
        feedback={feedback}
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </ChatLayout>
  );
};
