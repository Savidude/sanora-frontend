<!--
Sync Impact Report:
- Version change: new → 1.0.0
- Initial constitution creation
- Principles defined: Component-First, Mobile-First Responsive, Conversation-Centric UX, REST API Integration, User Experience Continuity
- Added sections: Technology Standards, Development Workflow
- Templates requiring updates: ✅ All templates aligned with new constitution structure
- Follow-up TODOs: None
-->

# Sanora Frontend Constitution

## Core Principles

### I. Component-First Architecture
Every UI feature MUST be built as a reusable, self-contained component with clear props interface. Components MUST be independently testable, documented, and follow single responsibility principle. No direct DOM manipulation outside component lifecycle methods.

**Rationale**: Enables maintainable, scalable UI development with consistent behavior across desktop and mobile platforms while supporting the conversational learning interface requirements.

### II. Mobile-First Responsive Design
All interface components MUST work seamlessly on mobile devices first, then enhance for desktop. Touch interactions, appropriate sizing, and accessibility MUST be prioritized. No desktop-only features without mobile equivalent.

**Rationale**: Finnish language learners need consistent access across all devices, and conversational learning benefits from the intimacy of mobile interaction patterns.

### III. Conversation-Centric UX (NON-NEGOTIABLE)
User interface MUST prioritize the conversational learning experience above all other features. Chat interface is the primary interaction model. All UI elements MUST support uninterrupted conversation flow with clear visual distinction between user input, teacher corrections, and teaching content.

**Rationale**: The core value proposition is conversational Finnish learning - any UI that disrupts this flow undermines the fundamental purpose of the application.

### IV. REST API Integration Standards
All backend communication MUST use RESTful patterns with consistent error handling, loading states, and offline graceful degradation. API responses MUST be typed and validated. No direct state mutations from API calls.

**Rationale**: Reliable communication with the teaching backend is essential for maintaining learning flow and providing consistent user experience across network conditions.

## Technology Standards

Modern web technologies with React ecosystem for component architecture, responsive CSS frameworks, TypeScript for type safety, and standardized REST client libraries. Progressive Web App capabilities for cross-platform deployment.

## Development Workflow

All features MUST support both desktop and mobile interaction patterns. User stories MUST include acceptance criteria for conversational flow continuity. Code reviews MUST verify component reusability and mobile responsiveness. Integration tests MUST validate REST API error scenarios.

## Governance

Constitution supersedes all other development practices. Component architecture decisions MUST align with conversation-centric principle. All changes to conversation interface require UX validation. Performance degradation that impacts conversation flow is grounds for immediate rollback.

**Version**: 1.0.0 | **Ratified**: 2025-11-08 | **Last Amended**: 2025-11-08
