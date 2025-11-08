# Component API Contracts

**Feature**: Teacher Response Components Implementation  
**Date**: 2025-11-09  
**Contract Type**: TypeScript Interface Definitions

## Core Component Contracts

### TeacherResponseComponent Contract

```typescript
/**
 * Main teacher response component that renders different message types
 * Extends existing TeacherFeedback component with structured sub-components
 */
interface TeacherResponseComponent {
  // Props
  messageType: 'initiation' | 'feedback' | 'conclusion';
  hasError: 'YES' | 'NO' | 'MINOR';
  timestamp: Date;
  sessionId: string;
  data: InitiationMessageData | ContinuationMessageData;
  
  // Methods
  render(): ReactElement;
  handleMissingData(section: string): ReactElement; // Fallback for "No data"
  
  // Events
  onSectionRender?: (section: string, hasData: boolean) => void;
  onErrorClassificationDisplay?: (classification: ErrorType) => void;
}
```

### InitiationMessageComponent Contract

```typescript
/**
 * Component for initial teacher messages with greeting, scenario, prompt, and tips
 */
interface InitiationMessageComponent {
  // Props
  greeting: string;
  scenario: string;
  initialPrompt: string;
  wordTips: WordTip[];
  timestamp: Date;
  
  // Layout Props
  isMobile: boolean;
  
  // Methods
  render(): ReactElement;
  renderSection(type: 'greeting' | 'scenario' | 'prompt' | 'tips'): ReactElement;
  
  // Events
  onPromptClick?: () => void;
  onWordTipSelect?: (tip: WordTip) => void;
}
```

### ContinuationMessageComponent Contract

```typescript
/**
 * Component for feedback messages with error analysis and conversation continuation
 */
interface ContinuationMessageComponent {
  // Props
  errorClassification: 'YES' | 'NO' | 'MINOR';
  feedbackText?: string;
  errorDetails?: ErrorDetail;
  continuationPrompt: string;
  wordTips: WordTip[];
  timestamp: Date;
  
  // Layout Props
  isMobile: boolean;
  
  // Methods
  render(): ReactElement;
  renderErrorClassification(): ReactElement;
  renderFeedbackSection(): ReactElement;
  renderContinuationPrompt(): ReactElement;
  
  // Events
  onContinuationClick?: () => void;
  onErrorDetailsExpand?: () => void;
}
```

### WordTipsComponent Contract

```typescript
/**
 * Reusable component for displaying Finnish-English vocabulary pairs
 */
interface WordTipsComponent {
  // Props
  tips: WordTip[];
  layout: 'card' | 'inline';
  maxVisible?: number;
  showExpanded?: boolean;
  
  // Methods
  render(): ReactElement;
  renderTipCard(tip: WordTip, index: number): ReactElement;
  toggleExpansion(): void;
  
  // Events
  onTipSelect?: (tip: WordTip) => void;
  onExpandToggle?: (expanded: boolean) => void;
}
```

### ErrorClassificationComponent Contract

```typescript
/**
 * Visual error classification indicator with color-only design
 */
interface ErrorClassificationComponent {
  // Props
  classification: 'YES' | 'NO' | 'MINOR';
  size?: 'small' | 'medium' | 'large';
  
  // Methods
  render(): ReactElement;
  getStyleForClassification(type: ErrorType): ErrorClassificationStyle;
  
  // Events
  onClassificationClick?: (classification: ErrorType) => void;
}
```

## State Management Contracts

### TeacherResponseState

```typescript
/**
 * State interface for teacher response component management
 */
interface TeacherResponseState {
  // Display State
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  
  // Content State
  currentResponse?: TeacherResponseProps;
  sectionsRendered: string[];
  fallbackSections: string[];
  
  // Interaction State
  expandedWordTips: boolean;
  selectedTip?: WordTip;
  
  // Methods
  updateResponse(data: TutorResponseData): void;
  handleSectionFallback(section: string): void;
  toggleWordTipsExpansion(): void;
}
```

### ResponsiveLayoutState

```typescript
/**
 * Responsive layout state for mobile-first design
 */
interface ResponsiveLayoutState {
  isMobile: boolean;
  screenWidth: number;
  sectionOrder: string[];
  
  // Methods
  updateLayout(width: number): void;
  getSectionPriority(messageType: string): string[];
}
```

## Service Layer Contracts

### TeacherResponseService

```typescript
/**
 * Service interface for processing API responses into component props
 */
interface TeacherResponseService {
  // Methods
  mapApiResponseToProps(response: AgentResponse): TeacherResponseProps;
  validateResponseData(data: TutorResponseData): boolean;
  handleMissingFields(data: Partial<TutorResponseData>): TutorResponseData;
  
  // Error Handling
  createFallbackResponse(error: string): TeacherResponseProps;
}
```

## CSS Module Contracts

### Component Styling Structure

```typescript
/**
 * CSS Modules class name contracts for consistent styling
 */
interface TeacherResponseStyles {
  // Container Classes
  teacherResponse: string;
  initiationMessage: string;
  continuationMessage: string;
  
  // Section Classes
  greetingSection: string;
  scenarioSection: string;
  promptSection: string;
  errorClassification: string;
  feedbackSection: string;
  wordTipsSection: string;
  
  // State Classes
  errorYes: string;
  errorMinor: string;
  errorNo: string;
  mobile: string;
  desktop: string;
  
  // Interaction Classes
  clickable: string;
  expanded: string;
  fallback: string;
}
```

## API Integration Contract

Leverages existing `/api/v1/chat/message` endpoint from api.yaml with no modifications required. Component contracts map directly to `TutorResponseData` structure:

- `message_type` → `messageType`
- `has_error` → `hasError` 
- `greeting` → `greeting`
- `scenario` → `scenario`
- `conversation_continuation` → `conversationContinuation/initialPrompt`
- `word_tips` → `wordTips`
- `error_details` → `errorDetails`
- `feedback_text` → `feedbackText`

All contracts maintain type safety and support graceful degradation for incomplete API responses.