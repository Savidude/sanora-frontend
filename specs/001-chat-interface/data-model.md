# Data Model: Sanora Chat Interface

**Date**: 2025-11-08  
**Feature**: Chat Interface  
**Branch**: 001-chat-interface

## Core Entities

### UserMessage
Represents a message sent by the learner to the teacher.

**Fields**:
- `id`: string - Unique identifier for the message
- `content`: string - The actual message text (max 280 characters)
- `timestamp`: Date - When the message was sent
- `status`: 'pending' | 'sent' | 'error' - Message delivery status
- `sessionId`: string - Session identifier for conversation continuity

**Validation Rules**:
- Content must be 1-280 characters
- Content must not be empty or only whitespace
- SessionId must be a valid UUID format

**State Transitions**:
- pending → sent (successful delivery)
- pending → error (delivery failure)
- error → pending (retry attempt)

### TeacherFeedback
Represents structured feedback from the teacher agent.

**Fields**:
- `id`: string - Unique identifier for the feedback
- `messageType`: 'initiation' | 'feedback' | 'conclusion' - Type of teacher response
- `hasError`: 'YES' | 'NO' | 'MINOR' - Error classification from API
- `components`: FeedbackComponent[] - Array of 4 visual feedback components
- `timestamp`: Date - When the feedback was received
- `sessionId`: string - Session identifier

**Relationships**:
- Belongs to one ChatSession
- Responds to one UserMessage

### FeedbackComponent
Individual component within teacher feedback (4 components per feedback).

**Fields**:
- `id`: string - Component identifier
- `type`: 'grammar' | 'vocabulary' | 'pronunciation' | 'context' - Component purpose
- `content`: string - Component content (can be empty as placeholder)
- `borderColor`: 'green' | 'yellow' | 'orange' | 'red' - Semantic color indicator
- `size`: 'small' | 'medium' | 'large' - Dynamic sizing based on content

**Validation Rules**:
- Each feedback must have exactly 4 components
- Border colors must follow semantic pattern (green=good, yellow=caution, orange=warning, red=error)
- Content can be empty (placeholder requirement)

### ChatSession
Represents the complete conversation session.

**Fields**:
- `sessionId`: string - Unique session identifier (UUID)
- `messages`: UserMessage[] - Array of user messages
- `feedback`: TeacherFeedback[] - Array of teacher responses  
- `startTime`: Date - When the session began
- `lastActivity`: Date - Most recent message/feedback timestamp
- `isActive`: boolean - Whether session is currently active

**Validation Rules**:
- SessionId must be unique and persistent across browser sessions
- Messages and feedback arrays maintain chronological order
- LastActivity updates with each new message or feedback

**State Transitions**:
- inactive → active (user sends first message)
- active → inactive (session timeout or explicit end)

### MessageInput
Represents the input area state and behavior.

**Fields**:
- `value`: string - Current input text
- `charCount`: number - Number of characters typed
- `isDisabled`: boolean - Whether input is disabled during sending
- `showError`: boolean - Whether to display validation error
- `errorMessage`: string - Specific error message to display

**Validation Rules**:
- Value must be ≤ 280 characters
- CharCount must equal value.length
- Input disabled only during message sending state

## Type Definitions

### API Integration Types
Based on the provided OpenAPI specification:

```typescript
// Request to backend
interface PromptRequest {
  message: string;
  sessionId: string;
}

// Response from backend
interface AgentResponse {
  success: boolean;
  data: TutorResponseData;
  session_id: string;
  timestamp: string;
}

interface TutorResponseData {
  message_type: 'initiation' | 'feedback' | 'conclusion';
  has_error: 'YES' | 'NO' | 'MINOR';
  feedback_text?: string;
  error_details?: ErrorDetail;
  greeting?: string;
  scenario?: string;
  conversation_continuation: string;
  word_tips: WordTip[];
}

interface ErrorDetail {
  user_mistake?: string;
  corrections: string[];
  explanation?: string;
}

interface WordTip {
  finnish: string;
  english: string;
}
```

### UI State Types

```typescript
interface ChatUIState {
  messages: UserMessage[];
  feedback: TeacherFeedback[];
  input: MessageInputState;
  session: ChatSessionState;
  ui: UIState;
}

interface UIState {
  isLoading: boolean;
  error: string | null;
  showRetry: boolean;
  isMobile: boolean;
}
```

## Data Flow

1. **User Input**: MessageInput validates and formats user text
2. **Message Creation**: UserMessage entity created with 'pending' status
3. **API Request**: PromptRequest sent to `/api/v1/chat/message`
4. **Response Processing**: AgentResponse mapped to TeacherFeedback entity
5. **UI Update**: Both UserMessage and TeacherFeedback rendered in chat
6. **Persistence**: ChatSession updated in localStorage for continuity

## Persistence Strategy

- **localStorage**: Complete ChatSession for cross-session continuity
- **sessionStorage**: Temporary UI state (input drafts, scroll position)
- **Memory**: Active conversation state during session
- **API**: No client-side persistence of backend data (stateless frontend)

## Performance Considerations

- **Message Limits**: Implement virtual scrolling for 100+ messages
- **Memory Management**: Cleanup old sessions after 30 days
- **State Updates**: Immutable updates to prevent unnecessary re-renders
- **API Caching**: Cache session metadata but not conversation content