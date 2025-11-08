# Data Model: Teacher Response Components

**Feature**: Teacher Response Components Implementation  
**Date**: 2025-11-09  
**Design Phase**: Phase 1

## Core Entities

### TeacherResponseProps

**Purpose**: Main props interface for teacher response components

```typescript
interface TeacherResponseProps {
  messageType: 'initiation' | 'feedback' | 'conclusion';
  hasError: 'YES' | 'NO' | 'MINOR';
  timestamp: Date;
  sessionId: string;
  data: InitiationMessageData | ContinuationMessageData;
}
```

**Validation Rules**:
- `messageType` must be one of the enum values from API contract
- `hasError` must match ErrorType from API specification
- `timestamp` required for all responses
- `sessionId` must be valid UUID format
- `data` shape determined by messageType

**Relationships**: Parent container for message-specific data interfaces

### InitiationMessageData

**Purpose**: Data structure for initial teacher messages

```typescript
interface InitiationMessageData {
  greeting: string;
  scenario: string;
  conversationContinuation: string;
  wordTips: WordTip[];
}
```

**Validation Rules**:
- All fields required for initiation messages
- `greeting` and `scenario` must be non-empty strings
- `conversationContinuation` serves as initial prompt
- `wordTips` array must contain 4-6 items

**State Transitions**: Static data, no internal state changes

### ContinuationMessageData

**Purpose**: Data structure for feedback and continuation messages

```typescript
interface ContinuationMessageData {
  feedbackText?: string;
  errorDetails?: ErrorDetail;
  conversationContinuation: string;
  wordTips: WordTip[];
}
```

**Validation Rules**:
- `conversationContinuation` always required
- `feedbackText` optional but recommended for learning feedback
- `errorDetails` required when hasError is 'YES' or 'MINOR'
- `wordTips` array must contain 4-6 items

**State Transitions**: Static data, no internal state changes

### ErrorDetail

**Purpose**: Structured error feedback information

```typescript
interface ErrorDetail {
  userMistake: string;
  corrections: string[];
  explanation: string;
}
```

**Validation Rules**:
- `userMistake` must describe specific error made by user
- `corrections` array must contain at least one suggested correction
- `explanation` must provide learning-focused reasoning

**Relationships**: Used within ContinuationMessageData when errors present

### WordTip

**Purpose**: Vocabulary assistance pairing

```typescript
interface WordTip {
  finnish: string;
  english: string;
}
```

**Validation Rules**:
- Both `finnish` and `english` fields required
- `finnish` must contain valid Finnish text (Unicode support)
- `english` should be concise translation or definition
- Special characters supported for Finnish diacritics (ä, ö, å)

**Relationships**: Array member in both message data types

### ErrorClassificationStyle

**Purpose**: Visual styling configuration for error indicators

```typescript
interface ErrorClassificationStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  label: string;
}

const ERROR_STYLES: Record<ErrorType, ErrorClassificationStyle> = {
  'YES': {
    backgroundColor: '#ef4444',
    textColor: '#ffffff',
    borderColor: '#dc2626',
    label: 'Error'
  },
  'MINOR': {
    backgroundColor: '#f59e0b',
    textColor: '#ffffff', 
    borderColor: '#d97706',
    label: 'Minor Error'
  },
  'NO': {
    backgroundColor: '#10b981',
    textColor: '#ffffff',
    borderColor: '#059669',
    label: 'Correct'
  }
};
```

**Validation Rules**:
- Colors must provide sufficient contrast for accessibility
- Labels must be localized if i18n is implemented
- Background colors align with clarification decision (color-only indicators)

## Component Props Interfaces

### InitiationMessageProps

```typescript
interface InitiationMessageProps {
  greeting: string;
  scenario: string;
  initialPrompt: string;
  wordTips: WordTip[];
  timestamp: Date;
}
```

### ContinuationMessageProps

```typescript
interface ContinuationMessageProps {
  errorClassification: ErrorType;
  feedbackText?: string;
  errorDetails?: ErrorDetail;
  continuationPrompt: string;
  wordTips: WordTip[];
  timestamp: Date;
}
```

### WordTipsProps

```typescript
interface WordTipsProps {
  tips: WordTip[];
  layout: 'card' | 'inline';
  maxVisible?: number;
}
```

### ErrorClassificationProps

```typescript
interface ErrorClassificationProps {
  classification: ErrorType;
  style: ErrorClassificationStyle;
}
```

## Data Flow

1. **API Response → Props Mapping**: chatService transforms TutorResponseData to component props
2. **Conditional Rendering**: TeacherFeedback routes to InitiationMessage or ContinuationMessage based on messageType
3. **Fallback Handling**: Missing optional fields trigger placeholder display ("No data" text)
4. **State Persistence**: Parent chat components manage conversation state via localStorage

## Validation Schema

All interfaces align with existing API contract (api.yaml) while adding component-specific typing for visual elements and user interactions. No additional backend changes required.