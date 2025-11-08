# Quickstart Guide: Hamburger Menu with New Conversation Option

**Feature**: 003-hamburger-menu  
**Date**: 2025-11-09  
**Estimated Development Time**: 4-6 hours  

## Overview

Implement a hamburger menu component in the top-left corner of the chat interface that provides users with a "Start New Conversation" option to reset their conversation state.

## Prerequisites

- React 18.2+ with TypeScript 5.3+
- Existing chat interface and conversation state management
- CSS Modules for styling
- Jest + React Testing Library for testing

## Development Checklist

### Phase 1: Core Component (2-3 hours)

- [ ] **Create HamburgerMenu component** (`src/components/layout/HamburgerMenu.tsx`)
  - Basic hamburger icon (3 horizontal lines)
  - Click handler for toggle functionality  
  - Props interface for `isOpen`, `onToggle`, `onClose`, `items`

- [ ] **Create useHamburgerMenu hook** (`src/hooks/useHamburgerMenu.ts`)
  - State management for `isOpen` boolean
  - `toggle()`, `open()`, `close()` functions
  - Outside click detection using ref and document listener
  - Escape key handler

- [ ] **Create CSS Module** (`src/components/layout/HamburgerMenu.module.css`)
  - Mobile-first responsive styles (320px+ base)
  - Hamburger icon styling (minimum 44px touch target)
  - Slide-out panel with CSS transform animations
  - Overlay for outside click detection

### Phase 2: Menu Panel & Animation (1-2 hours)

- [ ] **Implement slide-out panel**
  - Position absolute/fixed for overlay behavior
  - CSS transforms for hardware-accelerated animation
  - 300ms transition duration with ease-out timing
  - Z-index management to appear above chat interface

- [ ] **Add menu item rendering**
  - Map over `items` prop to render MenuItem components
  - Support for icons, labels, and click handlers
  - Disabled state styling
  - Variant support (default/danger styling)

- [ ] **Implement accessibility features**
  - ARIA labels: `aria-label="Open menu"`, `aria-expanded`
  - Focus management on menu open/close
  - Semantic HTML with proper `<button>` elements
  - Keyboard navigation (Tab, Escape)

### Phase 3: Conversation Reset Integration (1 hour)

- [ ] **Create conversation utilities** (`src/utils/conversationUtils.ts`)
  - `clearConversationData()` function to remove localStorage keys
  - `resetConversationUI()` function to trigger UI reset
  - `handleConversationError()` for error display and retry

- [ ] **Integrate with ChatLayout** (`src/components/layout/ChatLayout.tsx`)
  - Import and render HamburgerMenu in top-left corner
  - Create menu items configuration with "Start New Conversation"
  - Wire up conversation reset handlers

- [ ] **Connect to useChat hook** (`src/hooks/useChat.ts`)
  - Add `resetConversation()` method to hook
  - Clear conversation state and trigger UI refresh
  - Handle operation errors with user feedback

## Implementation Steps

### Step 1: Create the Component Structure

```typescript
// src/components/layout/HamburgerMenu.tsx
interface HamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  items: MenuItem[];
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen, onToggle, onClose, items
}) => {
  // Component implementation
};
```

### Step 2: Add State Management Hook

```typescript
// src/hooks/useHamburgerMenu.ts
export function useHamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Outside click and escape key handling
  // Return { isOpen, toggle, close, open, menuRef }
}
```

### Step 3: Style with Mobile-First CSS

```css
/* src/components/layout/HamburgerMenu.module.css */
.hamburgerMenu {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
}

.menuIcon {
  width: 44px;
  height: 44px;
  /* Mobile-first touch target */
}

.menuPanel {
  transform: translateX(-100%);
  transition: transform 0.3s ease-out;
}

.menuPanel--open {
  transform: translateX(0);
}
```

### Step 4: Integrate with Chat Layout

```typescript
// src/components/layout/ChatLayout.tsx
export const ChatLayout: React.FC = () => {
  const menuState = useHamburgerMenu();
  const { resetConversation } = useChat();
  
  const menuItems = [
    {
      id: 'new-conversation',
      label: 'Start New Conversation',
      onClick: async () => {
        await resetConversation();
        menuState.close();
      },
      variant: 'danger' as const
    }
  ];

  return (
    <div className={styles.chatLayout}>
      <HamburgerMenu {...menuState} items={menuItems} />
      {/* existing chat interface */}
    </div>
  );
};
```

## Testing Strategy

### Unit Tests

```typescript
// tests/components/layout/HamburgerMenu.test.tsx
describe('HamburgerMenu', () => {
  test('renders hamburger icon', () => {
    // Test component rendering
  });
  
  test('toggles menu on click', () => {
    // Test state changes
  });
  
  test('closes on outside click', () => {
    // Test outside click behavior
  });
});
```

### Integration Tests

```typescript
// tests/integration/conversation-reset.test.tsx
describe('Conversation Reset Flow', () => {
  test('clears conversation data and resets UI', () => {
    // Test complete reset workflow
  });
  
  test('handles reset errors gracefully', () => {
    // Test error scenarios
  });
});
```

## File Locations

| File | Purpose |
|------|---------|
| `src/components/layout/HamburgerMenu.tsx` | Main component |
| `src/components/layout/HamburgerMenu.module.css` | Component styles |  
| `src/hooks/useHamburgerMenu.ts` | State management hook |
| `src/utils/conversationUtils.ts` | Conversation reset utilities |
| `tests/components/layout/HamburgerMenu.test.tsx` | Component tests |
| `tests/integration/conversation-reset.test.tsx` | Integration tests |

## Success Criteria Validation

After implementation, verify:

- ✅ Menu accessible within 1 second of interface load (SC-001)
- ✅ New conversation starts in under 3 clicks (SC-002)
- ✅ Menu opens/closes within 300ms (SC-004)  
- ✅ Conversation reset completes within 2 seconds (SC-005)
- ✅ Functions correctly across browsers and device sizes (SC-006)

## Common Pitfalls

1. **Z-index conflicts**: Ensure menu appears above all chat interface elements
2. **Touch target size**: Maintain minimum 44px for mobile accessibility  
3. **Memory leaks**: Clean up event listeners in useEffect cleanup
4. **Animation interruption**: Handle component unmount during animations
5. **localStorage errors**: Implement proper error handling for storage operations

## Next Steps

After completing implementation:

1. Run test suite to verify functionality
2. Test on mobile devices for touch interactions
3. Validate accessibility with screen reader
4. Performance test animation smoothness
5. Integration test with existing chat features

For detailed implementation guidance, refer to:
- [Component API Contract](contracts/component-api.md)
- [Data Model](data-model.md)  
- [Research Decisions](research.md)