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
│   └── layout/        # Layout components
├── pages/             # Route components
├── services/          # API integration
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── styles/            # CSS modules
```

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
