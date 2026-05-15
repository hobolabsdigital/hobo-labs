# Speed Up Project Node Design

## 1. Overview
Currently, the `ProjectNode` takes 10-20 seconds to appear on the canvas because it waits for a Vercel AI SDK sub-agent to fully generate a rewritten JSON project card. We will dramatically speed this up by returning static project data instantly and decoupling the generation of contextual fields (`problem`, `solution`, `quote`) into a background client-side stream.

## 2. Architecture & Data Flow
1. **Server-Side Tool Instant Return**: The `showProject` tool in `/api/chat/route.ts` will bypass the LLM entirely. It will fetch the raw project data via `getProjectSource(slug)` and instantly return the static fields (`id`, `title`, `year`, `role`, `image`).
2. **Instant Canvas Render**: The Chat hook will receive this static result immediately and spawn the `ProjectNode` on the canvas.
3. **Client-Side Stream Trigger**: When the `ProjectNode` mounts, if it lacks `problem` and `solution` fields, it will invoke a new API route (e.g., `/api/project-context`) using Vercel AI SDK's `useObject`.
4. **Live React State**: The streaming chunks will be written directly into the `useCanvasStore`, updating the specific node's data in real-time.

## 3. Component Updates
- **ProjectNode.tsx (Compact)**: Will render immediately with static assets. It will display a skeleton shimmer for the `quote` field if `isContextStreaming` is true.
- **ProjectModalOverlay.tsx (Expanded)**: Instead of capturing a static snapshot of the node's data on click, `useProjectModalStore` will now only store the active `nodeId`. The modal will render live data directly from `useCanvasStore.getState().nodes.find(n => n.id === nodeId)`. It will also render skeleton shimmers for the `problem`, `solution`, and `quote` sections while streaming.
- **API Routes**: Create `/api/project-context` which receives the chat history and the project slug, and uses `streamObject` to generate the dynamic contextual fields.

## 4. Edge Cases & Handling
- **Modal Opening Mid-Stream**: Because the modal overlay tracks the live `useCanvasStore` node data by ID, opening the modal while the stream is active will seamlessly continue showing the streaming text/skeletons without interruption.
- **Dossier/Skeleton UI Removal**: The old "accessing dossier" pipeline (which spawned `DossierNode` and a temporary `SkeletonProjectNode`) will be completely removed, as the `ProjectNode` now renders instantly.

## 5. Scope
This feature strictly replaces the server-side sub-agent block with client-side streaming for project nodes. It requires modifications to `route.ts`, `useCanvasStore`, `ProjectNode`, `ProjectExpandedView`, and the creation of one new API route.
