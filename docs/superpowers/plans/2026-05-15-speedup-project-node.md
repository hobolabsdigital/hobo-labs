# Speed Up Project Node Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Speed up `ProjectNode` rendering from 10-20 seconds to instantaneous by decoupling static data from LLM-generated contextual data, streaming the latter via a separate API route directly into a live React state.

**Architecture:** We will strip the LLM sub-agent out of the `showProject` tool in `/api/chat/route.ts`. Instead, `showProject` will immediately return static project data (title, year, image, etc.) so the canvas can render the card instantly. The `ProjectNode` component will then mount and fire a request to a new `/api/project-context` route. This route will use `streamObject` to generate the contextual fields (`problem`, `solution`, `quote`). As chunks stream in, they update the node data in `useCanvasStore`, dynamically replacing shimmer skeletons in both the compact node and the expanded modal overlay in real-time.

**Tech Stack:** React, Zustand, Vercel AI SDK (`streamObject`), Framer Motion.

---

### Task 1: Store Modifications

**Files:**
- Modify: `src/features/canvas/store/useCanvasStore.ts`
- Modify: `src/features/project-modal/store/useProjectModalStore.ts`

- [ ] **Step 1: Clean up Dossier legacy state and add Node updater**

In `src/features/canvas/store/useCanvasStore.ts`, remove the unused dossier states (`activeDossierId`, `dossierStatus`, etc.) and replace them with a generic node updater so we can merge streaming chunks.

```typescript
// Add to CanvasState interface:
updateNodeData: (id: string, partialData: Record<string, any>) => void;

// Remove from CanvasState interface:
// activeDossierId, dossierStatus, dossierSlug, dossierTitle, skeletonProjectId, addDossier, updateDossierStatus, revealProject
```

Implement `updateNodeData` in the store:
```typescript
  updateNodeData: (id, partialData) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === id
          ? { ...n, data: { ...n.data, ...partialData } }
          : n
      )
    }));
  },
```

- [ ] **Step 2: Update useProjectModalStore to store only nodeId**

In `src/features/project-modal/store/useProjectModalStore.ts`, change `projectData` to `activeNodeId` and `heroSrc`.

```typescript
export interface ProjectModalState {
  isOpen: boolean;
  animationPhase: 'idle' | 'opening' | 'open' | 'closing';
  activeNodeId: string | null;
  heroSrc: string | null;
  open: (nodeId: string, heroSrc: string) => void;
  close: () => void;
  setAnimationPhase: (phase: ProjectModalState['animationPhase']) => void;
}

export const useProjectModalStore = create<ProjectModalState>((set) => ({
  isOpen: false,
  animationPhase: 'idle',
  activeNodeId: null,
  heroSrc: null,
  open: (nodeId, heroSrc) => set({ isOpen: true, animationPhase: 'opening', activeNodeId: nodeId, heroSrc }),
  close: () => set({ isOpen: false, animationPhase: 'idle', activeNodeId: null, heroSrc: null }),
  setAnimationPhase: (phase) => {
    set(() => {
      if (phase === 'idle') {
        return { animationPhase: 'idle', isOpen: false };
      }
      return { animationPhase: phase };
    });
  },
}));
```

---

### Task 2: API Route Updates

**Files:**
- Modify: `src/lib/ai/project-editor.ts`
- Modify: `src/app/api/chat/route.ts`
- Create: `src/app/api/project-context/route.ts`

- [ ] **Step 1: Export static project data fetcher**

In `src/lib/ai/project-editor.ts`, expose the logic that finds a project and its images:

```typescript
// Add to src/lib/ai/project-editor.ts
export function getProjectStaticData(slug: string) {
  const chunk = findProjectBySlug(slug);
  if (!chunk) return null;

  const portfolioDir = path.join(process.cwd(), 'public', 'portfolio');
  const files = fs.existsSync(portfolioDir) ? fs.readdirSync(portfolioDir) : [];
  
  const slugLower = slug.toLowerCase();
  const exactMain = files.find(f => f.toLowerCase() === `${slugLower}.png`);
  
  const searchKey = slugLower.replace(/-/g, '');
  const searchTokens = slugLower.split('-');
  const fallbackToken = searchTokens[searchTokens.length - 1];
  
  const relatedFiles = files.filter(f => {
    const normalizedF = f.toLowerCase().replace(/-/g, '');
    return (normalizedF.includes(searchKey) || normalizedF.includes(fallbackToken)) && f.match(/\.(png|jpg|jpeg)$/i);
  });

  return {
    title: chunk.metadata.title,
    year: chunk.metadata.year,
    role: chunk.metadata.role,
    techStack: chunk.metadata.techStack,
    image: exactMain ? `/portfolio/${exactMain}` : null,
    gallery: relatedFiles.filter(f => f !== exactMain).map(f => `/portfolio/${f}`),
    _rawContent: chunk.content, // Used for context generation later
    isContextStreaming: true, // Flag for the UI
  };
}
```

- [ ] **Step 2: Simplify the `showProject` tool in Chat API**

In `src/app/api/chat/route.ts`, remove `createProjectEditor` and update the `showProject` tool to be instant:

```typescript
import { getProjectStaticData } from '@/lib/ai/project-editor';

// Inside execute function of showProject tool:
execute: async ({ slug }) => {
  const data = getProjectStaticData(slug);
  if (!data) return { error: `Project "${slug}" not found.` };

  // Omit raw content from the chat UI response payload
  const { _rawContent, ...clientData } = data;
  return { ...clientData, slug };
}
```

- [ ] **Step 3: Create Streaming Route for Project Context**

Create `src/app/api/project-context/route.ts`:

```typescript
import { streamObject } from 'ai';
import { z } from 'zod';
import { createModel } from '@/lib/ai/config';
import { getProjectStaticData } from '@/lib/ai/project-editor';

const contextSchema = z.object({
  problem: z.string(),
  solution: z.string(),
  quote: z.string(),
});

export async function POST(req: Request) {
  try {
    const { slug, messages } = await req.json();
    const projectData = getProjectStaticData(slug);

    if (!projectData) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }

    const result = streamObject({
      model: createModel(true),
      schema: contextSchema,
      system: `You are writing contextual copy for a portfolio project titled "${projectData.title}".
Based on the raw case study data below, generate the problem, solution, and a compelling pull quote.
Make it fit the conversation context if any is provided in the chat history.

Raw Case Study:
${projectData._rawContent}
`,
      messages: messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
```

---

### Task 3: Chat Hook Modifications

**Files:**
- Modify: `src/features/editor-chat/hooks/useEditorialChat.ts`

- [ ] **Step 1: Remove Dossier logic**

Remove `addDossier`, `updateDossierStatus`, `revealProject`, and the `data-dossier` stream listener from `useEditorialChat.ts`. 

- [ ] **Step 2: Update Tool Call Handler**

In `onToolCall`, handle `showProject` instantly:

```typescript
        case 'showProject': {
          const result = (toolCall as any).result || (toolCall as any).output;
          if (result && !result.error) {
             addProject(result, toolCall.toolCallId);
          }
          return;
        }
```

---

### Task 4: UI Updates & Stream Management

**Files:**
- Modify: `src/features/canvas/components/nodes/ProjectNode.tsx`
- Modify: `src/features/project-modal/components/ProjectExpandedView.tsx`
- Modify: `src/features/project-modal/components/ProjectModalOverlay.tsx`

- [ ] **Step 1: Setup Client-side stream in ProjectNode**

In `ProjectNode.tsx`, trigger the object stream if `isContextStreaming` is true:

```tsx
import { useEffect } from 'react';
import { experimental_useObject as useObject } from 'ai/react';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { useEditorialChat } from '@/features/editor-chat/hooks/useEditorialChat';

export const ProjectNode = React.memo(function ProjectNode({ data, id: reactFlowId }: { data: any, id: string }) {
  const updateNodeData = useCanvasStore(state => state.updateNodeData);
  const { messages } = useEditorialChat(); 

  const { object, submit } = useObject({
    api: '/api/project-context',
    onFinish: (result) => {
      updateNodeData(reactFlowId, { ...result.object, isContextStreaming: false });
    }
  });

  useEffect(() => {
    if (data.isContextStreaming && !data.problem) {
      submit({ slug: data.slug, messages: messages.slice(-4) }); 
    }
  }, [data.isContextStreaming, data.slug]);

  useEffect(() => {
    if (object) {
      updateNodeData(reactFlowId, object);
    }
  }, [object, reactFlowId, updateNodeData]);

  const handleHeroClick = () => {
    useProjectModalStore.getState().open(reactFlowId, heroSrc);
  };
```

Update Quote rendering to handle streaming:
```tsx
  const isStreaming = data.isContextStreaming;
  // Replace {quote && <p ...>} with:
  {isStreaming && !data.quote ? (
    <div className="h-4 w-3/4 rounded mt-2 bg-foreground/10 animate-pulse" />
  ) : (
    data.quote && <p className="text-base text-foreground/60 leading-relaxed line-clamp-2 italic mt-2">&ldquo;{data.quote}&rdquo;</p>
  )}
```

- [ ] **Step 2: Update ProjectModalOverlay to read live state**

In `ProjectModalOverlay.tsx`, read from `useCanvasStore`:

```tsx
  const { isOpen, activeNodeId, heroSrc, close } = useProjectModalStore();
  const projectData = useCanvasStore(state => state.nodes.find(n => n.id === activeNodeId)?.data);
```

- [ ] **Step 3: Add Skeletons to Expanded View**

In `ProjectExpandedView.tsx`:

```tsx
  const isStreaming = data.isContextStreaming;

  // Inside Problem block
  {isStreaming && !data.problem ? <div className="h-16 w-full rounded bg-foreground/10 animate-pulse" /> : <p className="text-sm">{data.problem}</p>}
  
  // Inside Solution block
  {isStreaming && !data.solution ? <div className="h-16 w-full rounded bg-foreground/10 animate-pulse" /> : <p className="text-sm">{data.solution}</p>}

  // Inside Quote block
  {isStreaming && !data.quote ? <div className="h-8 w-2/3 rounded bg-foreground/10 animate-pulse" /> : <div>&ldquo;{data.quote}&rdquo;</div>}
```
