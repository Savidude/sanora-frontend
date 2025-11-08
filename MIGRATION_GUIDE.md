# Migration Guide: Teacher Response Components

## What Changed?

The teacher feedback display has been completely redesigned from a 4-square component grid (grammar, vocabulary, pronunciation, context) to structured message components that show:

### For Initiation Messages:
- **Greeting** section
- **Scenario** section  
- **Let's Practice** prompt section
- **Word Tips** as expandable cards

### For Continuation/Feedback Messages:
- **Error Classification** visual indicator (color-coded: red/yellow/green)
- **Feedback** section with user mistakes and corrections
- **Explanation** of errors
- **Continue the Conversation** prompt
- **Word Tips** as expandable cards

## Technical Changes

### Updated Components
- ✅ `useChat` hook now uses `TeacherResponseProps` instead of `TeacherFeedback`
- ✅ `ChatInterface` now renders `TeacherResponse` component instead of `TeacherFeedback`
- ✅ New `mapApiResponseToTeacherResponse` function in `chatService`

### New Component Structure
```
src/components/chat/
├── TeacherResponse.tsx (new - main wrapper)
└── TeacherFeedback/
    ├── InitiationMessage/
    │   ├── InitiationMessage.tsx
    │   └── InitiationMessage.module.css
    ├── ContinuationMessage/
    │   ├── ContinuationMessage.tsx
    │   └── ContinuationMessage.module.css
    ├── WordTipsComponent/
    │   ├── WordTipsComponent.tsx
    │   └── WordTipsComponent.module.css
    ├── ErrorClassificationComponent/
    │   ├── ErrorClassificationComponent.tsx
    │   └── ErrorClassificationComponent.module.css
    └── ErrorBoundary.tsx
```

## Testing the Changes

### Step 1: Clear Browser Storage
Since the data format has changed, you need to clear localStorage:

1. Open your browser DevTools (F12 or right-click → Inspect)
2. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → `http://localhost:3000` (or your dev URL)
4. Right-click and select **Clear** or delete these specific keys:
   - `sanora-messages`
   - `sanora-feedback`
   - `sanora-session-id` (optional - will create a new session)

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Test Initiation Message
1. Send your first message in the chat
2. You should see a teacher response with:
   - A greeting section
   - A scenario description
   - A "Let's Practice" prompt
   - Word tips displayed as cards (grid layout on desktop, stack on mobile)

### Step 4: Test Continuation Message
1. Send a follow-up message
2. You should see:
   - An error classification badge (colored indicator)
   - Feedback details if there are errors
   - Corrections suggestions
   - A continuation prompt
   - More word tips

### Step 5: Test Responsive Design
1. Open DevTools
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Test different screen sizes:
   - Mobile (320px-640px): Single column, larger touch targets
   - Tablet (640px-768px): 2-column word tip grid
   - Desktop (768px+): 3-4 column word tip grid

## What to Look For

### ✅ Expected Behavior:
- Clean, organized sections with clear headings
- Word tips displayed as cards in a responsive grid
- Error classification shown as a colored badge (not 4 squares)
- Finnish characters (ä, ö, å) render correctly
- Sections have colored left borders for visual hierarchy
- Mobile: content stacks vertically with proper spacing
- Desktop: content uses more horizontal space

### ❌ If You Still See Old Layout:
- 4 squares labeled "grammar, vocabulary, pronunciation, context"
- No section headings like "Greeting", "Scenario", etc.
- Word tips are text lists instead of cards

**Solution**: Clear localStorage as described above and hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## API Response Compatibility

The new components use the existing API contract from `/api/v1/chat/message`. No backend changes are required. The mapping function (`mapApiResponseToTeacherResponse`) handles:

- `message_type` → Determines which component to show (InitiationMessage vs ContinuationMessage)
- `greeting`, `scenario` → Initiation message sections
- `conversation_continuation` → Used as prompt or continuation
- `word_tips` → Displayed as card grid
- `has_error` → Determines error classification color
- `error_details` → Shown in feedback section with corrections
- `feedback_text` → General feedback message

## Rollback (If Needed)

If you need to revert to the old component temporarily:

1. In `src/hooks/useChat.ts`:
   ```typescript
   // Change back to:
   import { TeacherFeedback } from '../types/chat';
   const teacherFeedback = chatService.mapResponseToFeedback(response);
   ```

2. In `src/components/chat/ChatInterface.tsx`:
   ```typescript
   // Change back to:
   import { TeacherFeedback as TeacherFeedbackComponent } from './TeacherFeedback';
   ```

3. Clear localStorage and refresh

## Questions?

If you encounter issues:
1. Check browser console for errors
2. Verify localStorage is cleared
3. Check that dev server restarted after clearing cache
4. Ensure all TypeScript compilation errors are resolved (`npm run build` to check)
