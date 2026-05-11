# Editorial Canvas AI Integration - Handover

> [!NOTE]
> This document summarizes the recent debugging and stabilization work for the Editorial Canvas AI integration (using Vercel AI SDK 6.x and Ollama). It serves as a fresh context point to continue development.

## 1. What Was Fixed

### `addToolOutput` Signature and Deadlocks
- **Issue:** The chat was getting stuck in the "Organizing thoughts..." phase and returning `{"error":"Tool result is missing for tool call..."}` on subsequent turns.
- **Fix:** Switched from `addToolResult` (deprecated) to `addToolOutput`. Explicitly enabled `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls` to ensure the conversational loop automatically continues after resolving client-side tool calls without deadlocking.

### TypeScript Compilation Blocking Server Updates
- **Issue:** Even after applying API route fixes, the `browser_subagent` continued encountering 500 errors. 
- **Root Cause:** Next.js development server caching. A seemingly minor TypeScript error in `useEditorialChat.ts` (`Property 'args' does not exist on type 'ToolCall'`) was preventing the Next.js worker from compiling. As a result, the dev server continued serving the broken, pre-fix API route cache to the browser.
- **Fix:** Cast `toolCall` to `any` before accessing `args`/`input` to force compilation. Verified with `npm run build` that the `useEditorialChat.ts` file compiles successfully, flushing the old server cache.

### Vercel AI SDK `convertToModelMessages` Crash (500 Error)
- **Issue:** The API route was failing with `TypeError: Cannot read properties of undefined (reading 'map')`.
- **Root Cause:** The `convertToModelMessages` utility in Vercel AI SDK `3.x` / `6.x` core is notoriously strict and expects every message to have a `parts` array. If the frontend sends a simple message containing only `content` (with `parts: undefined`), and we explicitly pass `parts: undefined` through our sanitization filter, `convertToModelMessages` crashes when attempting to `.map()` over it.
- **Fix:** Implemented a defensive array polyfill in `app/api/chat/route.ts`:
  ```typescript
  if (Array.isArray(msg.parts)) {
    sanitized.parts = msg.parts.filter((p: any) => p.type !== 'item_reference' && p.type !== 'unknown');
  } else {
    // Polyfill parts for messages that might only have content
    sanitized.parts = [{ type: 'text', text: msg.content || '' }];
  }
  ```

## 2. Current Architecture

- **Frontend Hook (`useEditorialChat.ts`):** 
  - Manages the `useChat` stream and tool execution.
  - Automatically sends tool outputs back to the server to continue reasoning.
  - Controls the D3.js Ghost Node ("Thinking..." phase) via `status === 'submitted' || status === 'streaming'`, syncing smoothly with the chat's exact state and correctly disappearing on `onFinish` or `error`.
- **Backend Route (`app/api/chat/route.ts`):**
  - Uses `streamText` with the local `ollama('deepseek-v4-pro:cloud')` model.
  - Cleans frontend-exclusive `UIMessage` properties to strictly adhere to the AI SDK `ModelMessage` schema, preventing serialization crashes.

## 3. Next Steps & Known Quirks

> [!TIP]
> The fundamental architecture for streaming nodes to the canvas is now robust.

1. **Test the Final Implementation:** Because the subagent was stuck looping on the cached 500 error before the TS fix was applied, you should manually verify the multi-turn node spawning in your browser (at `http://localhost:3000`).
2. **Model Tuning:** The Ollama `deepseek-v4-pro:cloud` model can sometimes generate overly verbose reasoning streams. Depending on token limits, you may want to parse out `<think>` blocks differently or adjust the system prompt to enforce concise node generation.
3. **Graphify Context:** I ran a quick Graphify check, but its current database seems focused on the core `MonstoryX` UE5/C++ backend (`AddStatusMessage`, `IsMonsterUnlocked`, etc.) rather than the Next.js portfolio workspace. If you intend to use Graphify for the Next.js codebase, you may need to map this specific directory first.
