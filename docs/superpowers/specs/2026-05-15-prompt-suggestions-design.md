# Prompt Suggestions Design

## Overview
A new feature for the editorial AI that allows it to optionally suggest 3 context-aware prompts at the end of its response. These suggestions will appear as interactive nodes on the canvas. When a user selects a suggestion, the selected node morphs into a prompt node, the unselected suggestions are removed to keep the canvas clean, and the AI is triggered to continue the conversation.

## 1. AI Tool & Prompting
- **Tool Definition**: Add a new `suggestPrompts` tool to the AI's configuration (`src/lib/ai/tools.ts` and API route).
- **Arguments**: The tool will accept an array of exactly 3 short strings representing suggested next steps.
- **System Prompt**: Update the system instructions so the AI knows it *must* call this tool exactly once at the very end of its turn, after generating any Hero or Text nodes.

## 2. Canvas Integration
- **SuggestionNode Component**: Create a new `SuggestionNode.tsx` component in `src/features/canvas/components/nodes/`. It will be styled as a subtle, interactive button that matches the brutalist/editorial aesthetic.
- **Node Spawning**: The `useEditorialChat` hook (or equivalent tool handler) will intercept the `suggestPrompts` tool call and spawn 3 `SuggestionNode`s.
- **Physics**: Because they are first-class ReactFlow nodes, they will automatically be integrated into the D3 physics simulation and fan out naturally from the parent node.

## 3. Click Interaction & Cleanup
- **State Transition**: When a user clicks a `SuggestionNode`, the ReactFlow state will be updated immediately:
  1. The clicked node's `type` property changes from `suggestion` to `prompt`.
  2. The remaining sibling `SuggestionNode`s from that specific turn are filtered out and removed from the canvas.
- **AI Trigger**: Simultaneously, the chat hook will append the selected prompt to the message history and trigger the AI to continue the chain.

## 4. Scope & Edge Cases
- **Self-Review Checklist**:
  - *Placeholders*: None.
  - *Contradictions*: None.
  - *Ambiguity*: How do we identify sibling nodes for cleanup? We should attach a unique `batchId` to the `data` payload of each suggestion node when they are spawned. When one is clicked, we delete all other suggestion nodes that share that same `batchId`.
  - *Scope*: Narrow and focused on a single feature. No unrelated refactoring.
