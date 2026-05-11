# Graph Report - portfolio  (2026-05-10)

## Corpus Check
- 37 files · ~6,580 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 87 nodes · 106 edges · 24 communities (7 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `557c88a9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]

## God Nodes (most connected - your core abstractions)
1. `useCanvasStore` - 11 edges
2. `EditorialCanvas()` - 5 edges
3. `cn()` - 5 edges
4. `Button()` - 4 edges
5. `useEditorialPhysics()` - 4 edges
6. `useEdgeAnimations()` - 4 edges
7. `useEditorialChat()` - 4 edges
8. `DebugPanel()` - 3 edges
9. `Input()` - 3 edges
10. `ollama` - 2 edges

## Surprising Connections (you probably didn't know these)
- `DebugPanel()` --calls--> `useCanvasStore`  [EXTRACTED]
  src/components/DebugPanel.tsx → src/store/useCanvasStore.ts
- `EditorialCanvas()` --calls--> `useCanvasStore`  [EXTRACTED]
  src/components/EditorialCanvas.tsx → src/store/useCanvasStore.ts
- `EditorialCanvas()` --calls--> `useEditorialPhysics()`  [EXTRACTED]
  src/components/EditorialCanvas.tsx → src/hooks/useEditorialPhysics.ts
- `EditorialCanvas()` --calls--> `useEdgeAnimations()`  [EXTRACTED]
  src/components/EditorialCanvas.tsx → src/hooks/useEdgeAnimations.ts
- `EditorialCanvas()` --calls--> `useEditorialChat()`  [EXTRACTED]
  src/components/EditorialCanvas.tsx → src/hooks/useEditorialChat.ts

## Communities (24 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.21
Nodes (12): DebugPanel(), EditorialCanvas(), initialNodes, nodeTypes, useEdgeAnimations(), useEditorialChat(), useEditorialPhysics(), GhostNode() (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.38
Nodes (6): ChatInput(), ChatInputProps, cn(), Button(), buttonVariants, Input()

### Community 2 - "Community 2"
Cohesion: 0.47
Nodes (3): TextNode(), AnnotationText(), IrisText()

### Community 3 - "Community 3"
Cohesion: 0.4
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **21 isolated node(s):** `messages`, `messages`, `messages`, `config`, `messages` (+16 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `messages`, `messages`, `messages` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._