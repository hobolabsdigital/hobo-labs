# Prompt Suggestions Implementation Plan (Plan B: Floating Overlay)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a new feature where the AI suggests 3 context-aware prompts that appear as floating pill buttons right above the chat input box. Clicking a pill submits the prompt and clears the suggestions.

**Architecture:** We already added the `suggestPrompts` tool to the Vercel AI SDK setup (Task 1 from previous plan is complete). The frontend chat hook will intercept this tool and store the suggestions in `useCanvasStore`. The `ChatInput` component will read these suggestions and render them as an overlay above the input field.

**Tech Stack:** React, Zustand, Framer Motion, Vercel AI SDK.

---

## User Review Required
Please review the proposed Plan B (Floating Pill Overlay) and approve if it matches your expectations.

---

### Task 1: Store Integration

**Files:**
- Modify: `/Users/emile/Hobolabs/2026/website/apps/portfolio/src/features/canvas/store/useCanvasStore.ts`
- Modify: `/Users/emile/Hobolabs/2026/website/apps/portfolio/src/features/editor-chat/hooks/useEditorialChat.ts`

- [ ] **Step 1: Extend the Canvas Store**
In `src/features/canvas/store/useCanvasStore.ts`, add to `CanvasState`:
```typescript
  activeSuggestions: string[];
  setActiveSuggestions: (suggestions: string[]) => void;
  clearSuggestions: () => void;
```
Implement them in the store:
```typescript
  activeSuggestions: [],
  setActiveSuggestions: (suggestions) => set({ activeSuggestions: suggestions }),
  clearSuggestions: () => set({ activeSuggestions: [] }),
```

- [ ] **Step 2: Handle Tool Call in Chat Hook**
In `src/features/editor-chat/hooks/useEditorialChat.ts`:
1. Extract `setActiveSuggestions` and `clearSuggestions` from `useCanvasStore`.
2. Clear suggestions when sending a new message: inside `sendMessage` or `handleSend`.
3. In `onToolCall`, handle `suggestPrompts`:
```typescript
        case 'suggestPrompts':
          setActiveSuggestions(input.suggestions);
          break;
```

---

### Task 2: Floating Pill Component & ChatInput Integration

**Files:**
- Modify: `/Users/emile/Hobolabs/2026/website/apps/portfolio/src/features/editor-chat/components/ChatInput.tsx`

- [ ] **Step 1: Add Suggestions UI to ChatInput**
In `src/features/editor-chat/components/ChatInput.tsx`:
1. Extract `activeSuggestions` and `clearSuggestions` from `useCanvasStore`.
2. Add a `handleSuggestionClick` function that calls `clearSuggestions` and then triggers `sendMessage({ text: suggestion })`.
3. Render the suggestions above the `<form>`. Use `framer-motion` (or standard Tailwind transitions) to animate them sliding up.

```tsx
<div className="flex flex-wrap gap-2 mb-3 justify-center">
  {activeSuggestions.map((suggestion, idx) => (
    <button
      key={idx}
      onClick={() => handleSuggestionClick(suggestion)}
      className="px-4 py-2 rounded-full text-sm font-medium bg-foreground/10 text-foreground border border-foreground/20 hover:bg-foreground hover:text-background transition-colors shadow-lg backdrop-blur-md"
    >
      {suggestion}
    </button>
  ))}
</div>
```

- [ ] **Step 2: Manual Verification**
1. Type a message in the chat.
2. Wait for the AI's response.
3. Observe the 3 pills appearing above the chat input.
4. Click a pill; ensure the text is submitted and the pills disappear.

- [ ] **Step 3: Commit**
```bash
git add src/features/canvas/store/useCanvasStore.ts src/features/editor-chat/hooks/useEditorialChat.ts src/features/editor-chat/components/ChatInput.tsx
git commit -m "feat(ui): implement floating prompt suggestions above chat input"
```
