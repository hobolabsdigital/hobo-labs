# Graph Report - portfolio  (2026-05-12)

## Corpus Check
- 44 files · ~26,270 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 78 nodes · 36 edges · 5 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]

## God Nodes (most connected - your core abstractions)
1. `ChatInput()` - 2 edges
2. `useEditorialChat()` - 2 edges
3. `getRandomOffset()` - 2 edges
4. `createHeroNode()` - 2 edges
5. `config` - 1 edges
6. `eslintConfig` - 1 edges
7. `nextConfig` - 1 edges

## Surprising Connections (you probably didn't know these)
- `ChatInput()` --calls--> `useEditorialChat()`  [INFERRED]
  src/features/editor-chat/components/ChatInput.tsx → src/features/editor-chat/hooks/useEditorialChat.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.33
Nodes (2): createHeroNode(), getRandomOffset()

### Community 1 - "Community 1"
Cohesion: 0.5
Nodes (2): ChatInput(), useEditorialChat()

### Community 3 - "Community 3"
Cohesion: 1.0
Nodes (1): config

### Community 4 - "Community 4"
Cohesion: 1.0
Nodes (1): eslintConfig

### Community 5 - "Community 5"
Cohesion: 1.0
Nodes (1): nextConfig

## Knowledge Gaps
- **3 isolated node(s):** `config`, `eslintConfig`, `nextConfig`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 0`** (7 nodes): `nodeFactories.ts`, `createEdge()`, `createGhostNode()`, `createHeroNode()`, `createPromptNode()`, `createTextNode()`, `getRandomOffset()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 1`** (4 nodes): `ChatInput()`, `useEditorialChat()`, `ChatInput.tsx`, `useEditorialChat.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (2 nodes): `config`, `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (2 nodes): `eslint.config.mjs`, `eslintConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (2 nodes): `next.config.ts`, `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._