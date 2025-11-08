# Sanora Frontend - Finnish Language Learning Chat Interface

A modern, responsive chat interface for Finnish language learning built with React and TypeScript.

## Features

- 🎯 Clean, modern chat interface with responsive design
- 💬 Real-time message sending and receiving
- 📚 Structured teacher feedback with greeting, scenario, prompt, and word tips
- 🎨 Visual error classification with color-coded indicators
- 📱 Mobile-first responsive design (640px, 768px, 1024px breakpoints)
- ✨ 280-character message limit with real-time validation
- 🔄 Session persistence across browser sessions
- ⌨️ Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- 🌍 Finnish character support (ä, ö, å)
- ♿ Accessibility features (ARIA labels, screen reader support)
- 🍔 Hamburger menu for quick access to conversation actions
- 🔄 Start new conversation option with data reset

## Tech Stack

- React 18+
- TypeScript 5.0+
- Vite (build tool)
- Axios (API client)
- CSS Modules (styling)
- Jest + React Testing Library (testing)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Development Server

The development server runs at `http://localhost:3000` with hot module replacement enabled.

**Note**: After pulling the latest changes with the new teacher response components, you may need to clear your browser's localStorage to remove old data format:
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear localStorage for localhost:3000
4. Refresh the page

### API Configuration

The backend API is expected to run at `http://localhost:8000`. Update the proxy configuration in `vite.config.ts` if your backend runs on a different port.

## Project Structure

```
src/
├── components/
│   ├── chat/          # Chat-specific components
│   ├── ui/            # Reusable UI components
│   └── layout/        # Layout components (ChatLayout, HamburgerMenu)
├── pages/             # Route components
├── services/          # API integration
├── hooks/             # Custom React hooks (useChat, useHamburgerMenu, useLocalStorage)
├── types/             # TypeScript type definitions (chat, menu, storage)
├── utils/             # Utility functions (conversationUtils, formatting, validation)
└── styles/            # CSS modules
```

## Component Usage

### HamburgerMenu Component

The `HamburgerMenu` component provides navigation options for the chat interface.

```tsx
import { HamburgerMenu } from './components/layout/HamburgerMenu';
import { useHamburgerMenu } from './hooks/useHamburgerMenu';

const MyComponent = () => {
  const menuState = useHamburgerMenu();
  
  const menuItems = [
    {
      id: 'new-conversation',
      label: 'Start New Conversation',
      onClick: () => console.log('Reset conversation'),
      variant: 'danger',
    },
  ];

  return (
    <div ref={menuState.menuRef}>
      <HamburgerMenu
        isOpen={menuState.isOpen}
        onToggle={menuState.toggle}
        onClose={menuState.close}
        items={menuItems}
      />
    </div>
  );
};
```

### useHamburgerMenu Hook

Custom hook for managing hamburger menu state and behavior.

**Features:**
- Menu open/close state management
- Outside click detection
- Escape key handling
- Focus management for accessibility

**Returns:**
- `isOpen`: Current menu state (boolean)
- `toggle()`: Toggle menu open/closed
- `open()`: Open menu
- `close()`: Close menu
- `menuRef`: Ref for menu container (for outside click detection)

### Conversation Reset

The application includes a conversation reset feature accessible via the hamburger menu:

1. Click the hamburger menu icon in the top-left corner
2. Select "Start New Conversation"
3. Conversation data is cleared from browser storage
4. UI resets to the initial welcome state
5. Page automatically reloads to ensure clean state

**Note**: This action permanently deletes all conversation history. Use with caution.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## Building for Production

```bash
npm run build
```

The optimized production build will be created in the `dist/` directory.

## Code Style

This project uses ESLint and Prettier for code formatting. Run `npm run lint:fix` to automatically fix linting issues and `npm run format` to format code.

## Performance Goals

- Initial load: < 3 seconds
- Interaction response: < 200ms
- Smooth scrolling: 60fps

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private project
