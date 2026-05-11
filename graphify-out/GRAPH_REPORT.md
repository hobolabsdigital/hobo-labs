# Graph Report - portfolio  (2026-05-11)

## Corpus Check
- 31 files · ~14,689 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 67 nodes · 53 edges · 7 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 5 edges
2. `calculateAndSetCursor()` - 3 edges
3. `Button()` - 3 edges
4. `handlePointerMove()` - 2 edges
5. `handlePointerDown()` - 2 edges
6. `IrisText()` - 2 edges
7. `AnnotationText()` - 2 edges
8. `buttonVariants` - 2 edges
9. `Input()` - 2 edges
10. `getRandomOffset()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Input()` --calls--> `cn()`  [INFERRED]
  src/components/ui/input.tsx → src/lib/utils.ts
- `Button()` --calls--> `cn()`  [INFERRED]
  src/components/ui/button.tsx → src/lib/utils.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.52
Nodes (4): cn(), Button(), buttonVariants, Input()

### Community 1 - "Community 1"
Cohesion: 0.33
Nodes (2): createHeroNode(), getRandomOffset()

### Community 2 - "Community 2"
Cohesion: 0.47
Nodes (3): calculateAndSetCursor(), handlePointerDown(), handlePointerMove()

### Community 3 - "Community 3"
Cohesion: 0.47
Nodes (2): AnnotationText(), IrisText()

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (1): config

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (1): eslintConfig

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (1): nextConfig

## Knowledge Gaps
- **3 isolated node(s):** `config`, `eslintConfig`, `nextConfig`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 1`** (7 nodes): `nodeFactories.ts`, `createEdge()`, `createGhostNode()`, `createHeroNode()`, `createPromptNode()`, `createTextNode()`, `getRandomOffset()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (6 nodes): `TextNode()`, `TextNode.tsx`, `annotation-text.tsx`, `iris-text.tsx`, `AnnotationText()`, `IrisText()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (2 nodes): `config`, `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (2 nodes): `eslint.config.mjs`, `eslintConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (2 nodes): `next.config.ts`, `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `cn()` (e.g. with `Button()` and `Input()`) actually correct?**
  _`cn()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._