# Graph Report - portfolio  (2026-05-14)

## Corpus Check
- 57 files · ~916,917 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 106 nodes · 53 edges · 5 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]

## God Nodes (most connected - your core abstractions)
1. `calculateNodePosition()` - 4 edges
2. `POST()` - 2 edges
3. `getRandomOffset()` - 2 edges
4. `createHeroNode()` - 2 edges
5. `createProjectNode()` - 2 edges
6. `findSimilarChunks()` - 2 edges
7. `config` - 1 edges
8. `eslintConfig` - 1 edges
9. `nextConfig` - 1 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `findSimilarChunks()`  [INFERRED]
  src/app/api/chat/route.ts → src/lib/vectorStore.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.31
Nodes (4): calculateNodePosition(), createHeroNode(), createProjectNode(), getRandomOffset()

### Community 2 - "Community 2"
Cohesion: 0.5
Nodes (2): POST(), findSimilarChunks()

### Community 5 - "Community 5"
Cohesion: 1.0
Nodes (1): config

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (1): eslintConfig

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (1): nextConfig

## Knowledge Gaps
- **3 isolated node(s):** `config`, `eslintConfig`, `nextConfig`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 2`** (4 nodes): `POST()`, `findSimilarChunks()`, `route.ts`, `vectorStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (2 nodes): `config`, `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (2 nodes): `eslint.config.mjs`, `eslintConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (2 nodes): `next.config.ts`, `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._