# Tasks: Teacher Response Components Implementation

**Input**: Design documents from `/specs/002-teacher-response/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend SPA**: `src/`, `tests/` at repository root (React-based structure)
- **Components**: `src/components/chat/` for conversation-centric components
- **Types**: `src/types/chat.ts` for TypeScript definitions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for teacher response components

- [X] T001 Create directory structure for teacher response components in src/components/chat/TeacherFeedback/
- [X] T002 [P] Create InitiationMessage component directory in src/components/chat/TeacherFeedback/InitiationMessage/
- [X] T003 [P] Create ContinuationMessage component directory in src/components/chat/TeacherFeedback/ContinuationMessage/
- [X] T004 [P] Create WordTipsComponent directory in src/components/chat/TeacherFeedback/WordTipsComponent/
- [X] T005 [P] Create ErrorClassificationComponent directory in src/components/chat/TeacherFeedback/ErrorClassificationComponent/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Update TypeScript types in src/types/chat.ts with teacher response component interfaces
- [X] T007 [P] Add InitiationMessageData, ContinuationMessageData, and TeacherResponseProps interfaces to src/types/chat.ts
- [X] T008 [P] Add WordTip, ErrorDetail, and ErrorClassificationStyle interfaces to src/types/chat.ts
- [X] T009 [P] Add ERROR_STYLES constant with color specifications to src/types/chat.ts
- [X] T010 Update chatService in src/services/chatService.ts with API response mapping function
- [X] T011 Add mapApiResponseToTeacherResponse function to src/services/chatService.ts
- [X] T012 Update TeacherFeedback component in src/components/chat/TeacherFeedback.tsx to route between message types

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Display Teacher Initiation Message (Priority: P1) 🎯 MVP

**Goal**: Language learners receive structured initiation messages with greeting, scenario, prompt, and word tips in clearly organized sections

**Independent Test**: Send first message in new session and verify teacher response displays all four sections (greeting, scenario, initial prompt, word tips) in readable format

### Implementation for User Story 1

- [X] T013 [P] [US1] Create InitiationMessage component in src/components/chat/TeacherFeedback/InitiationMessage/InitiationMessage.tsx
- [X] T014 [P] [US1] Create InitiationMessage CSS module in src/components/chat/TeacherFeedback/InitiationMessage/InitiationMessage.module.css
- [X] T015 [P] [US1] Create WordTipsComponent in src/components/chat/TeacherFeedback/WordTipsComponent/WordTipsComponent.tsx
- [X] T016 [P] [US1] Create WordTipsComponent CSS module in src/components/chat/TeacherFeedback/WordTipsComponent/WordTipsComponent.module.css
- [X] T017 [US1] Implement greeting section rendering in InitiationMessage component
- [X] T018 [US1] Implement scenario section rendering in InitiationMessage component
- [X] T019 [US1] Implement initial prompt section rendering in InitiationMessage component
- [X] T020 [US1] Integrate WordTipsComponent with card-style layout for initiation messages
- [X] T021 [US1] Add fallback handling for missing data sections with "No data" text placeholder
- [X] T022 [US1] Export InitiationMessage component from src/components/chat/TeacherFeedback/InitiationMessage/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Display Teacher Continuation Feedback (Priority: P1)

**Goal**: Language learners receive feedback with visual error indicators, detailed analysis, explanations, and conversation continuation

**Independent Test**: Submit user message with intentional errors and verify feedback displays error classification, corrections, explanations, and continuation prompts

### Implementation for User Story 2

- [X] T023 [P] [US2] Create ErrorClassificationComponent in src/components/chat/TeacherFeedback/ErrorClassificationComponent/ErrorClassificationComponent.tsx
- [X] T024 [P] [US2] Create ErrorClassificationComponent CSS module in src/components/chat/TeacherFeedback/ErrorClassificationComponent/ErrorClassificationComponent.module.css
- [X] T025 [P] [US2] Create ContinuationMessage component in src/components/chat/TeacherFeedback/ContinuationMessage/ContinuationMessage.tsx
- [X] T026 [P] [US2] Create ContinuationMessage CSS module in src/components/chat/TeacherFeedback/ContinuationMessage/ContinuationMessage.module.css
- [X] T027 [US2] Implement error classification visual indicators with color-only backgrounds (red/yellow/green)
- [X] T028 [US2] Implement feedback details section with user mistakes and corrections display
- [X] T029 [US2] Implement error explanation section rendering in ContinuationMessage component
- [X] T030 [US2] Implement conversation continuation prompt section with prominent call-to-action styling
- [X] T031 [US2] Integrate WordTipsComponent for continuation messages with consistent card layout
- [X] T032 [US2] Add conditional rendering for optional feedback sections (feedbackText, errorDetails)
- [X] T033 [US2] Export ErrorClassificationComponent from src/components/chat/TeacherFeedback/ErrorClassificationComponent/index.ts
- [X] T034 [US2] Export ContinuationMessage component from src/components/chat/TeacherFeedback/ContinuationMessage/index.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Responsive Teacher Response Layout (Priority: P2)

**Goal**: Teacher responses optimized for different screen sizes with appropriate text sizing, spacing, and section organization

**Independent Test**: View teacher responses on mobile and desktop devices to verify layout adapts appropriately while maintaining readability

### Implementation for User Story 3

- [X] T035 [P] [US3] Add mobile-first responsive breakpoints to InitiationMessage.module.css
- [X] T036 [P] [US3] Add mobile-first responsive breakpoints to ContinuationMessage.module.css  
- [X] T037 [P] [US3] Add mobile-first responsive breakpoints to WordTipsComponent.module.css
- [X] T038 [P] [US3] Add mobile-first responsive breakpoints to ErrorClassificationComponent.module.css
- [X] T039 [US3] Implement mobile content-first section prioritization in InitiationMessage component
- [X] T040 [US3] Implement mobile content-first section prioritization in ContinuationMessage component
- [X] T041 [US3] Add responsive card grid layout for WordTipsComponent (mobile stack, desktop grid)
- [X] T042 [US3] Ensure minimum 44px touch targets for mobile interactions
- [X] T043 [US3] Add responsive text scaling (minimum 14px) across all teacher response sections
- [X] T044 [US3] Integrate useResponsive hook for dynamic layout switching in teacher response components

**Checkpoint**: All user stories should now be independently functional with full responsive support

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final integration

- [X] T045 [P] Add comprehensive error boundary handling for teacher response components
- [X] T046 [P] Implement Finnish character support validation for WordTipsComponent
- [X] T047 [P] Add accessibility improvements (ARIA labels, screen reader support) to all teacher response components
- [ ] T048 [P] Optimize component performance with React.memo for static teacher response data
- [X] T049 [P] Add component prop validation with TypeScript strict mode compliance
- [X] T050 [P] Update existing TeacherFeedback component to fully integrate new structured components
- [ ] T051 [P] Add comprehensive JSDoc documentation for all teacher response component interfaces
- [ ] T052 Validate quickstart.md implementation guide against completed components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses WordTipsComponent from US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 & US2 components but independently testable

### Within Each User Story

- Component files and CSS modules can be created in parallel [P]
- Component structure before section implementation
- Core rendering before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T005) can run in parallel
- All Foundational TypeScript interface tasks (T007-T009) can run in parallel
- Within US1: T013-T016 (component and CSS file creation) can run in parallel
- Within US2: T023-T026 (component and CSS file creation) can run in parallel  
- Within US3: T035-T038 (CSS responsive updates) can run in parallel
- All Polish tasks (T045-T051) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch component and CSS creation for User Story 1 together:
Task: "Create InitiationMessage component in src/components/chat/TeacherFeedback/InitiationMessage/InitiationMessage.tsx"
Task: "Create InitiationMessage CSS module in src/components/chat/TeacherFeedback/InitiationMessage/InitiationMessage.module.css"
Task: "Create WordTipsComponent in src/components/chat/TeacherFeedback/WordTipsComponent/WordTipsComponent.tsx"
Task: "Create WordTipsComponent CSS module in src/components/chat/TeacherFeedback/WordTipsComponent/WordTipsComponent.module.css"
```

---

## Parallel Example: User Story 2

```bash
# Launch component creation for User Story 2 together:
Task: "Create ErrorClassificationComponent in src/components/chat/TeacherFeedback/ErrorClassificationComponent/ErrorClassificationComponent.tsx"
Task: "Create ErrorClassificationComponent CSS module in src/components/chat/TeacherFeedback/ErrorClassificationComponent/ErrorClassificationComponent.module.css"
Task: "Create ContinuationMessage component in src/components/chat/TeacherFeedback/ContinuationMessage/ContinuationMessage.tsx"
Task: "Create ContinuationMessage CSS module in src/components/chat/TeacherFeedback/ContinuationMessage/ContinuationMessage.module.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T012) - CRITICAL: blocks all stories
3. Complete Phase 3: User Story 1 (T013-T022)
4. **STOP and VALIDATE**: Test initiation messages independently
5. Deploy/demo if ready - basic teacher response functionality working

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: initiation messages!)
3. Add User Story 2 → Test independently → Deploy/Demo (feedback and error classification!)
4. Add User Story 3 → Test independently → Deploy/Demo (full responsive support!)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T012)
2. Once Foundational is done:
   - Developer A: User Story 1 (T013-T022)
   - Developer B: User Story 2 (T023-T034) 
   - Developer C: User Story 3 (T035-T044)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks target different files with no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability  
- Each user story should be independently completable and testable
- US1 & US2 both have P1 priority - implement in parallel or based on team preference
- Commit after each task or logical group for incremental progress
- Stop at any checkpoint to validate story independently
- Focus on conversation-centric UX throughout implementation