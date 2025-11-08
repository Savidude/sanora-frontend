# Data Model: Hamburger Menu with New Conversation Option

**Date**: 2025-11-09  
**Feature**: 003-hamburger-menu  
**Phase**: 1 - Data Model Design

## Component Data Structures

### HamburgerMenu Component Props

```typescript
interface HamburgerMenuProps {
  /** Controls menu open/closed state */
  isOpen: boolean;
  
  /** Callback when menu toggle is requested (open/close) */
  onToggle: () => void;
  
  /** Callback when menu should be closed (outside click, item selection) */
  onClose: () => void;
  
  /** Menu items configuration */
  items: MenuItem[];
  
  /** Optional CSS class name for styling customization */
  className?: string;
  
  /** Optional test identifier for testing */
  'data-testid'?: string;
}

interface MenuItem {
  /** Unique identifier for the menu item */
  id: string;
  
  /** Display label for the menu item */
  label: string;
  
  /** Click handler for the menu item */
  onClick: () => void;
  
  /** Optional icon component or icon name */
  icon?: React.ReactNode | string;
  
  /** Optional disabled state */
  disabled?: boolean;
  
  /** Optional variant for styling (e.g., 'danger' for destructive actions) */
  variant?: 'default' | 'danger';
}
```

### Hook State Management

```typescript
interface UseHamburgerMenuReturn {
  /** Current menu open state */
  isOpen: boolean;
  
  /** Toggle menu open/closed */
  toggle: () => void;
  
  /** Close menu */
  close: () => void;
  
  /** Open menu */
  open: () => void;
  
  /** Ref for menu container (for outside click detection) */
  menuRef: RefObject<HTMLDivElement>;
}
```

## Conversation State Entities

### Conversation Data Structure (Existing)

```typescript
interface ConversationMessage {
  id: string;
  content: string;
  sender: 'user' | 'teacher';
  timestamp: Date;
  type?: 'text' | 'correction' | 'feedback';
}

interface ConversationState {
  messages: ConversationMessage[];
  isActive: boolean;
  startedAt: Date;
  lastActivityAt: Date;
}
```

### Storage Key Management

```typescript
interface ConversationStorageKeys {
  /** Main conversation messages */
  CONVERSATION_MESSAGES: 'sanora_conversation_messages';
  
  /** Conversation metadata */
  CONVERSATION_STATE: 'sanora_conversation_state';
  
  /** User preferences related to conversation */
  CONVERSATION_PREFERENCES: 'sanora_conversation_prefs';
  
  /** Temporary conversation data (drafts, etc.) */
  CONVERSATION_TEMP: 'sanora_conversation_temp';
}
```

## State Transitions

### Menu State Flow

```
[Closed] --click hamburger--> [Opening] --animation complete--> [Open]
[Open] --click outside--> [Closing] --animation complete--> [Closed]
[Open] --click item--> [Closing] --animation complete--> [Closed]
[Open] --escape key--> [Closing] --animation complete--> [Closed]
```

### Conversation Reset Flow

```
[Active Conversation] --click "Start New"--> [Confirming Reset]
[Confirming Reset] --confirm--> [Clearing Data] --success--> [Fresh State]
[Clearing Data] --error--> [Error State] --retry--> [Clearing Data]
[Error State] --cancel--> [Active Conversation]
```

## Validation Rules

### Menu Component Validation

- `isOpen` must be boolean
- `onToggle` and `onClose` must be functions
- `items` array must contain valid MenuItem objects
- Each MenuItem must have unique `id` and non-empty `label`
- MenuItem `onClick` handlers must be functions

### Conversation Data Validation

- Must clear all conversation-related localStorage keys atomically
- Must not leave partial conversation state after reset
- Must handle localStorage quota exceeded errors gracefully
- Must validate localStorage availability before operations

## Relationships

### Component Hierarchy

```
ChatLayout
├── HamburgerMenu (new)
│   └── MenuItem[] (items)
└── ChatInterface (existing)
    └── ConversationState (cleared by menu action)
```

### Data Flow

```
User Click → HamburgerMenu → MenuItem.onClick → clearConversationData() → 
localStorage.clear() → useChat.reset() → ChatInterface.resetToInitial()
```

## Error Handling

### Menu Operation Errors

- **Invalid menu state**: Fallback to closed state
- **Missing required props**: Console error + graceful degradation
- **Animation interruption**: Clean state reset to closed

### Conversation Clear Errors

- **localStorage unavailable**: Show error message, maintain current state
- **Partial clear failure**: Retry mechanism with exponential backoff
- **UI reset failure**: Reload page as last resort (rare edge case)

## Performance Considerations

### State Management

- Menu state changes trigger minimal re-renders (isolated component)
- Conversation clearing is async to prevent UI blocking
- localStorage operations batched where possible

### Memory Management

- Event listeners cleaned up on component unmount
- Animation frames cancelled if component unmounts during animation
- Conversation data cleared immediately from memory after localStorage clear