# Component API Contract: Hamburger Menu

**Version**: 1.0.0  
**Date**: 2025-11-09  
**Feature**: 003-hamburger-menu

## Component Interface

### HamburgerMenu Component

**Purpose**: Provides hamburger menu navigation with slide-out panel for chat application actions

**Location**: `src/components/layout/HamburgerMenu.tsx`

#### Props Interface

```typescript
interface HamburgerMenuProps {
  /** Controls menu open/closed state */
  isOpen: boolean;
  
  /** Callback when menu toggle is requested */
  onToggle: () => void;
  
  /** Callback when menu should be closed */
  onClose: () => void;
  
  /** Menu items to display */
  items: MenuItem[];
  
  /** Optional CSS class name */
  className?: string;
  
  /** Test identifier */
  'data-testid'?: string;
}

interface MenuItem {
  id: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}
```

#### Usage Contract

```typescript
// Basic usage in ChatLayout
<HamburgerMenu
  isOpen={menuState.isOpen}
  onToggle={menuState.toggle}
  onClose={menuState.close}
  items={[
    {
      id: 'new-conversation',
      label: 'Start New Conversation',
      onClick: handleNewConversation,
      variant: 'danger'
    }
  ]}
/>
```

#### Behavior Contract

**Opening/Closing**:
- Menu opens on `onToggle()` when `isOpen` is false
- Menu closes on `onToggle()` when `isOpen` is true  
- Menu closes on outside click (triggers `onClose()`)
- Menu closes on Escape key press (triggers `onClose()`)
- Menu closes after item selection (triggers `onClose()`)

**Animation**:
- Slide-out animation duration: 300ms maximum
- Hardware-accelerated transforms for performance
- Smooth easing function (ease-out curve)

**Accessibility**:
- Keyboard navigation via Tab key
- Screen reader support with ARIA labels
- Focus management on open/close
- Semantic HTML structure

#### CSS Module Contract

**File**: `HamburgerMenu.module.css`

**Required Classes**:
```css
.hamburgerMenu {
  /* Container positioning and base styles */
}

.menuIcon {
  /* Hamburger icon styling and interactions */
}

.menuPanel {
  /* Slide-out panel container */
}

.menuItem {
  /* Individual menu item styling */
}

.menuItem--danger {
  /* Destructive action styling (e.g., red text) */
}

.overlay {
  /* Background overlay when menu is open */
}

/* Animation states */
.menuPanel--opening {
  /* Animation styles for opening transition */
}

.menuPanel--closing {
  /* Animation styles for closing transition */
}
```

**Responsive Breakpoints**:
- Mobile-first base styles (320px+)
- Tablet enhancements (768px+)
- Desktop hover states (1024px+ with hover capability)

## Hook Interface

### useHamburgerMenu Hook

**Purpose**: Manages hamburger menu state and side effects

**Location**: `src/hooks/useHamburgerMenu.ts`

#### Interface

```typescript
function useHamburgerMenu(): UseHamburgerMenuReturn;

interface UseHamburgerMenuReturn {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
  menuRef: RefObject<HTMLDivElement>;
}
```

#### Behavior Contract

**State Management**:
- Maintains boolean `isOpen` state
- Provides toggle, open, close functions
- Handles outside click detection via ref
- Cleans up event listeners on unmount

**Side Effects**:
- Adds document click listener when menu is open
- Adds escape key listener when menu is open
- Removes listeners when menu closes or component unmounts

## Utility Interface

### Conversation Management

**Purpose**: Handles conversation data clearing and UI reset

**Location**: `src/utils/conversationUtils.ts`

#### Interface

```typescript
interface ConversationUtils {
  clearConversationData(): Promise<void>;
  resetConversationUI(): void;
  handleConversationError(error: Error): void;
}
```

#### Implementation Contract

```typescript
/**
 * Permanently deletes all conversation data from localStorage
 * @throws {Error} If localStorage is unavailable or operation fails
 */
async function clearConversationData(): Promise<void> {
  const keys = [
    'sanora_conversation_messages',
    'sanora_conversation_state', 
    'sanora_conversation_prefs',
    'sanora_conversation_temp'
  ];
  
  // Clear each key with error handling
  // Implement retry mechanism for partial failures
}

/**
 * Resets chat UI to initial welcome state
 */
function resetConversationUI(): void {
  // Trigger useChat hook reset
  // Clear any in-memory conversation state
  // Reset form inputs and UI state
}

/**
 * Handles conversation operation errors
 * @param error - The error that occurred
 */
function handleConversationError(error: Error): void {
  // Display user-friendly error message
  // Provide retry option
  // Log error for debugging
}
```

## Integration Contract

### ChatLayout Integration

**Required Changes**:
1. Import HamburgerMenu component
2. Add hamburger menu to top-left corner of layout
3. Integrate with existing responsive design
4. Handle z-index layering with chat interface

### useChat Hook Integration

**Required Changes**:
1. Add `resetConversation()` method to hook interface
2. Implement conversation state clearing
3. Trigger UI reset to initial state
4. Handle reset errors gracefully

### Event Flow Contract

```
User Interaction → HamburgerMenu → MenuItem.onClick → 
conversationUtils.clearConversationData() → 
useChat.resetConversation() → 
UI Reset → Menu Close
```

## Testing Contract

### Unit Test Requirements

**HamburgerMenu Component**:
- Renders menu icon and panel correctly
- Handles open/close state changes
- Triggers callbacks on user interactions
- Applies correct CSS classes for animations
- Supports keyboard navigation

**useHamburgerMenu Hook**:
- Manages state correctly
- Handles outside clicks
- Cleans up event listeners
- Provides stable function references

**Conversation Utils**:
- Clears localStorage data completely
- Handles errors gracefully  
- Provides retry mechanism
- Integrates with chat state management

### Integration Test Requirements

**Menu Behavior**:
- Opens/closes with correct animations
- Closes on outside click and escape key
- Maintains accessibility features
- Works on mobile and desktop

**Conversation Reset**:
- Clears all conversation data
- Resets UI to initial state
- Handles operation failures
- Preserves application routing

### Performance Requirements

- Menu interactions complete within 300ms
- Smooth 60fps animations on mobile devices
- No memory leaks from event listeners
- Efficient localStorage operations