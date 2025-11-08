# Quickstart Guide: Sanora Chat Interface

**Feature**: Chat Interface for Finnish Language Learning  
**Branch**: 001-chat-interface  
**Date**: 2025-11-08

## Overview

This guide provides step-by-step instructions for implementing the Sanora Chat Interface. The interface enables Finnish language learners to have conversations with an AI tutor through a modern, responsive chat UI.

## Prerequisites

- Node.js 18+ installed
- Basic knowledge of React and TypeScript
- Understanding of REST API integration
- Familiarity with CSS Modules or similar styling approaches

## Quick Setup

### 1. Install Dependencies

```bash
npm install react@^18.0.0 react-dom@^18.0.0
npm install typescript@^5.0.0 @types/react@^18.0.0 @types/react-dom@^18.0.0
npm install axios@^1.0.0
npm install @testing-library/react@^13.0.0 @testing-library/jest-dom@^5.0.0
npm install --save-dev jest@^29.0.0 playwright@^1.0.0
```

### 2. Project Structure

Create the following directory structure:

```
src/
├── components/chat/
├── components/ui/
├── components/layout/
├── services/
├── hooks/
├── types/
├── utils/
└── styles/
```

### 3. Core Implementation Steps

#### Step 1: Set up TypeScript Types

Create `src/types/chat.ts`:

```typescript
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
```

#### Step 2: Create API Service

Create `src/services/chatService.ts`:

```typescript
import axios from 'axios';
import { PromptRequest, AgentResponse } from './types/apiTypes';

const API_BASE_URL = '/api/v1';

export const chatService = {
  async sendMessage(request: PromptRequest): Promise<AgentResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/message`, request);
      return response.data;
    } catch (error) {
      throw new Error('Failed to send message');
    }
  }
};
```

#### Step 3: Build Core Components

##### MessageBubble Component

Create `src/components/chat/MessageBubble.tsx`:

```typescript
import React from 'react';
import { UserMessage } from '../../types/chat';
import styles from './MessageBubble.module.css';

interface Props {
  message: UserMessage;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  return (
    <div className={styles.messageBubble}>
      <div className={styles.content}>{message.content}</div>
      <div className={styles.timestamp}>
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
};
```

##### TeacherFeedback Component

Create `src/components/chat/TeacherFeedback.tsx`:

```typescript
import React from 'react';
import { TeacherFeedback } from '../../types/chat';
import styles from './TeacherFeedback.module.css';

interface Props {
  feedback: TeacherFeedback;
  isMobile: boolean;
}

export const TeacherFeedbackComponent: React.FC<Props> = ({ feedback, isMobile }) => {
  return (
    <div className={`${styles.feedback} ${isMobile ? styles.mobile : styles.desktop}`}>
      {feedback.components.map((component, index) => (
        <React.Fragment key={component.id}>
          <div 
            className={styles.component}
            style={{ borderColor: component.borderColor }}
          >
            {component.content || 'Placeholder content'}
          </div>
          {index < feedback.components.length - 1 && <hr className={styles.divider} />}
        </React.Fragment>
      ))}
    </div>
  );
};
```

#### Step 4: Create Chat Hook

Create `src/hooks/useChat.ts`:

```typescript
import { useState, useCallback, useEffect } from 'react';
import { UserMessage, TeacherFeedback } from '../types/chat';
import { chatService } from '../services/chatService';

export const useChat = (sessionId: string) => {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [feedback, setFeedback] = useState<TeacherFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (content.length > 280 || content.trim().length === 0) {
      setError('Message must be 1-280 characters');
      return;
    }

    const newMessage: UserMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      status: 'pending',
      sessionId
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage({
        message: content,
        sessionId
      });

      // Update message status
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ));

      // Add teacher feedback
      // Implementation depends on mapping AgentResponse to TeacherFeedback
      
    } catch (err) {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
      ));
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return {
    messages,
    feedback,
    isLoading,
    error,
    sendMessage
  };
};
```

#### Step 5: Add Responsive Styles

Create `src/styles/responsive.css`:

```css
/* Mobile-first responsive breakpoints */
.container {
  width: 100%;
  max-width: 100vw;
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 481px) {
  .container {
    max-width: 768px;
    margin: 0 auto;
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
  }
}

/* Teacher feedback responsive behavior */
.feedbackComponents {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 481px) {
  .feedbackComponents {
    flex-direction: row;
    gap: 0.5rem;
  }
}
```

## Testing Setup

### Unit Tests

Create `tests/components/MessageBubble.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../../src/components/chat/MessageBubble';

const mockMessage = {
  id: '1',
  content: 'Test message',
  timestamp: new Date(),
  status: 'sent' as const,
  sessionId: 'test-session'
};

describe('MessageBubble', () => {
  it('renders message content', () => {
    render(<MessageBubble message={mockMessage} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});
```

### Integration Tests

Create `tests/integration/chatService.test.ts`:

```typescript
import { chatService } from '../../src/services/chatService';

// Mock axios
jest.mock('axios');

describe('chatService', () => {
  it('sends message to correct endpoint', async () => {
    const request = {
      message: 'Hei!',
      sessionId: 'test-session'
    };

    // Test implementation
  });
});
```

## Development Workflow

1. **Start with UI Components**: Build MessageBubble and TeacherFeedback components first
2. **Add State Management**: Implement useChat hook for conversation state
3. **Integrate API**: Connect to backend using chatService
4. **Add Responsive Design**: Implement mobile-first CSS with 480px breakpoint
5. **Character Counting**: Add real-time validation for 280-character limit
6. **Error Handling**: Implement loading states and retry mechanisms
7. **Session Persistence**: Add localStorage for conversation continuity

## Key Implementation Notes

- **Character Limit**: Validate 280-character limit in real-time
- **Mobile Breakpoint**: Switch to vertical layout below 480px
- **Semantic Colors**: Use green, yellow, orange, red for feedback components
- **Loading States**: Show spinner on send button while processing
- **Error Handling**: Provide retry option for failed messages
- **Keyboard Shortcuts**: Enter sends message, Shift+Enter adds new line

## Performance Considerations

- Implement virtual scrolling for 100+ messages
- Use React.memo for message components to prevent unnecessary re-renders
- Debounce character count updates for smooth typing experience
- Optimize bundle size with code splitting

## Next Steps

1. Complete core components implementation
2. Add comprehensive test coverage
3. Implement session persistence
4. Add Progressive Web App capabilities
5. Optimize for production deployment

For detailed implementation guidance, refer to the `data-model.md` and `contracts/api.yaml` files in this specification.