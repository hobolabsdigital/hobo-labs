# Graph Report - .  (2026-05-13)

## Corpus Check
- Large corpus: 106 files · ~908,380 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 90 nodes · 46 edges · 5 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Node Factories|Node Factories]]
- [[_COMMUNITY_Chat API & RAG|Chat API & RAG]]
- [[_COMMUNITY_portfolio_postcss_config_config|portfolio_postcss_config_config]]
- [[_COMMUNITY_eslint_config_mjs|eslint_config_mjs]]
- [[_COMMUNITY_next_config|next_config]]

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

### Community 0 - "Node Factories"
Cohesion: 0.31
Nodes (4): calculateNodePosition(), createHeroNode(), createProjectNode(), getRandomOffset()

### Community 2 - "Chat API & RAG"
Cohesion: 0.5
Nodes (2): POST(), findSimilarChunks()

### Community 4 - "portfolio_postcss_config_config"
Cohesion: 1.0
Nodes (1): config

### Community 5 - "eslint_config_mjs"
Cohesion: 1.0
Nodes (1): eslintConfig

### Community 6 - "next_config"
Cohesion: 1.0
Nodes (1): nextConfig

## Knowledge Gaps
- **3 isolated node(s):** `config`, `eslintConfig`, `nextConfig`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Chat API & RAG`** (4 nodes): `POST()`, `findSimilarChunks()`, `route.ts`, `vectorStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `portfolio_postcss_config_config`** (2 nodes): `config`, `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `eslint_config_mjs`** (2 nodes): `eslint.config.mjs`, `eslintConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `next_config`** (2 nodes): `next.config.ts`, `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._