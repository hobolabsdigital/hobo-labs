# Prompt Suggestions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a new feature where the AI suggests 3 context-aware prompts as interactive nodes on the canvas, which morph into a prompt node upon click while cleaning up unselected siblings.

**Architecture:** We add a `suggestPrompts` tool to the Vercel AI SDK setup. The frontend chat hook intercepts this tool and spawns 3 `SuggestionNode`s via `useCanvasStore`. When a `SuggestionNode` is clicked, the store morphs it into a `PromptNode`, deletes the siblings sharing its `batchId`, and submits the prompt to the AI.

**Tech Stack:** React, Zustand, ReactFlow, Framer Motion, Vercel AI SDK.

---

### Task 1: AI Tool & Prompts

**Files:**
- Modify: `/Users/emile/Hobolabs/2026/website/apps/portfolio/src/lib/ai/tools.ts`
- Modify: `/Users/emile/Hobolabs/2026/website/apps/portfolio/src/lib/ai/prompts.ts`
- Modify: `/Users/emile/Hobolabs/2026/website/apps/portfolio/src/app/api/chat/route.ts`

- [ ] **Step 1: Add the suggestPrompts tool**
In `src/lib/ai/tools.ts`, add the new tool:
```typescript
export const suggestPrompts = tool({
  description: 'Suggest exactly 3 context-aware follow-up prompts for the user. MUST be called at the end of your turn.',
  inputSchema: z.object({
    suggestions: z.array(z.string()).length(3).describe('An array of exactly 3 short suggestion strings (max 5-7 words each).')
  }),
});
```

- [ ] **Step 2: Update the System Prompt**
In `src/lib/ai/prompts.ts`, add a new constraint under `## TOOL USAGE`:
```typescript
5. SUGGESTIONS: You MUST call the 'suggestPrompts' tool exactly once at the VERY END of every response to provide 3 relevant follow-up prompts for the user.
```

- [ ] **Step 3: Register the tool in the API Route**
In `src/app/api/chat/route.ts`, import `suggestPrompts` from `@/lib/ai/tools` and add it to the `tools` object passed to `streamText`.

- [ ] **Step 4: Manual Verification**
Run `npm run dev` and type a message. Observe the network tab or console to ensure the AI calls the `suggestPrompts` tool at the end.

- [ ] **Step 5: Commit**
```bash
git add src/lib/ai/tools.ts src/lib/ai/prompts.ts src/app/api/chat/route.ts
git commit -m "feat(ai): add suggestPrompts tool and update system prompt"
```

---

### Task 2: Store Integration & Node Factory

**Files:**
- Modify: `/Users/emile/Hobolabs/2026/website/apps/portfolio/src/features/canvas/store/nodeFactories.ts`
- Modify: `/Users/emile/Hobolabs/2026/website/apps/portfolio/src/features/canvas/store/useCanvasStore.ts`
- Modify: `/Users/emile/Hobolabs/2026/website/apps/portfolio/src/features/editor-chat/hooks/useEditorialChat.ts`

- [ ] **Step 1: Create Suggestion Node Factory**
In `src/features/canvas/store/nodeFactories.ts`, export a new function:
```typescript
export const createSuggestionNode = (id: string, text: string, batchId: string, sourceNode?: Node): Node => {
  let x = sourceNode ? sourceNode.position.x + 300 : 600;
  let y = sourceNode ? sourceNode.position.y + (Math.random() * 80 - 40) : 400;

  return { id, type: 'suggestion', position: { x, y }, data: { text, batchId } };
};
```

- [ ] **Step 2: Extend the Canvas Store**
In `src/features/canvas/store/useCanvasStore.ts`, import `createSuggestionNode`. Add to `CanvasState`:
```typescript
addSuggestions: (suggestions: string[], batchId: string) => void;
selectSuggestion: (batchId: string, selectedNodeId: string) => void;
pendingSuggestionPrompt: string | null;
setPendingSuggestionPrompt: (text: string | null) => void;
```
Implement them in the store:
```typescript
pendingSuggestionPrompt: null,
setPendingSuggestionPrompt: (text) => set({ pendingSuggestionPrompt: text }),
addSuggestions: (suggestions, batchId) => {
  set(state => {
    const validNodes = state.nodes.filter(n => n.type !== 'intro');
    const sourceNode = validNodes.find(n => n.id === state.lastPlacedNodeId) || validNodes[validNodes.length - 1];
    const newNodes = suggestions.map((text, i) => {
      const id = `suggestion-${batchId}-${i}`;
      const node = createSuggestionNode(id, text, batchId, sourceNode);
      node.data.creationIndex = state.nodeCreationCounter + i;
      return node;
    });
    const newEdges = sourceNode ? newNodes.map(n => createEdge(sourceNode.id, n.id)) : [];
    
    return {
      nodes: [...state.nodes, ...newNodes],
      edges: [...state.edges, ...newEdges],
      lastPlacedNodeId: newNodes[newNodes.length - 1].id,
      nodeCreationCounter: state.nodeCreationCounter + newNodes.length
    };
  });
},
selectSuggestion: (batchId, selectedNodeId) => {
  set(state => {
    // Morph the selected node to 'prompt' and remove the others in the batch
    const newNodes = state.nodes.filter(n => !(n.type === 'suggestion' && n.data.batchId === batchId && n.id !== selectedNodeId))
      .map(n => n.id === selectedNodeId ? { ...n, type: 'prompt' } : n);
    
    // Remove edges pointing to the deleted suggestion nodes
    const validNodeIds = new Set(newNodes.map(n => n.id));
    const newEdges = state.edges.filter(e => validNodeIds.has(e.target) && validNodeIds.has(e.source));
    
    return { nodes: newNodes, edges: newEdges, lastPlacedNodeId: selectedNodeId };
  });
},
```

- [ ] **Step 3: Handle Tool Call in Chat Hook**
In `src/features/editor-chat/hooks/useEditorialChat.ts`:
1. Extract `addSuggestions`, `pendingSuggestionPrompt`, and `setPendingSuggestionPrompt` from `useCanvasStore`.
2. In `onToolCall`, handle `suggestPrompts`:
```typescript
case 'suggestPrompts':
  addSuggestions(input.suggestions, toolCall.toolCallId);
  break;
```
3. Add a `useEffect` to trigger `sendMessage` when a suggestion is selected:
```typescript
useEffect(() => {
  if (pendingSuggestionPrompt) {
    const text = pendingSuggestionPrompt;
    setPendingSuggestionPrompt(null);
    sendMessage({ text });
  }
}, [pendingSuggestionPrompt, sendMessage, setPendingSuggestionPrompt]);
```

- [ ] **Step 4: Manual Verification**
Verify that the `suggestPrompts` tool creates nodes (though they will lack a component and might render as defaults) and click/submit logic doesn't crash.

- [ ] **Step 5: Commit**
```bash
git add src/features/canvas/store/nodeFactories.ts src/features/canvas/store/useCanvasStore.ts src/features/editor-chat/hooks/useEditorialChat.ts
git commit -m "feat(canvas): integrate prompt suggestions into store and chat hook"
```

---

### Task 3: Suggestion Node Component

**Files:**
- Create: `/Users/emile/Hobolabs/2026/website/apps/portfolio/src/features/canvas/components/nodes/SuggestionNode.tsx`
- Modify: `/Users/emile/Hobolabs/2026/website/apps/portfolio/src/features/canvas/components/EditorialCanvas.tsx`

- [ ] **Step 1: Create SuggestionNode Component**
Create `SuggestionNode.tsx`. It needs to access the store to select itself on click.
```typescript
"use client";

import React from 'react';
import { motion } from "framer-motion";
import { NodeHandles } from './NodeHandles';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Plus } from 'lucide-react';

export const SuggestionNode = React.memo(function SuggestionNode({ id, data }: { id: string, data: any }) {
  const selectSuggestion = useCanvasStore(state => state.selectSuggestion);
  const setPendingSuggestionPrompt = useCanvasStore(state => state.setPendingSuggestionPrompt);

  const handleClick = () => {
    selectSuggestion(data.batchId, id);
    setPendingSuggestionPrompt(data.text);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="max-w-xs p-3 bg-foreground/10 text-foreground relative shadow-lg rounded-full border border-foreground/20 cursor-pointer backdrop-blur-md flex items-center gap-2 group hover:bg-foreground hover:text-background transition-colors duration-300"
    >
      <NodeHandles />
      <Plus className="w-4 h-4 opacity-50 group-hover:opacity-100" />
      <p className="text-sm font-sans leading-snug whitespace-pre-wrap font-medium">
        {data.text}
      </p>
    </motion.div>
  );
});
```

- [ ] **Step 2: Register in EditorialCanvas**
In `EditorialCanvas.tsx`, import `SuggestionNode` and add it to `nodeTypes`:
```typescript
import { SuggestionNode } from './nodes/SuggestionNode';

const nodeTypes = {
  // ...
  suggestion: SuggestionNode,
};
```

- [ ] **Step 3: Manual Verification**
Type a message in the running app. Wait for the AI to respond. 3 Suggestion Nodes should spawn. Click one: it should morph into a Prompt node, the other 2 should vanish, and the AI should immediately start answering the clicked prompt.

- [ ] **Step 4: Commit**
```bash
git add src/features/canvas/components/nodes/SuggestionNode.tsx src/features/canvas/components/EditorialCanvas.tsx
git commit -m "feat(ui): add SuggestionNode component and register in canvas"
```
