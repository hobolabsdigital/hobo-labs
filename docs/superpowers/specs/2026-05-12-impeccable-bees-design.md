# Impeccable Bees Design Spec

## Overview
Evolve the "Mischievous Bees" AI swarm into a constructive, autonomous design intelligence by injecting the "Impeccable" design skill guidelines directly into their AI decision prompt. 

The swarm will abandon pure chaos in favor of generating highly aesthetic, curated, and context-aware styling adjustments (fonts, OKLCH colors, spacing) to individual nodes on the canvas.

## Scope
This design is strictly focused on upgrading the AI prompt and ensuring that the React Flow node components correctly inherit and display the dynamically generated CSS variables.

## Architecture & Implementation

### 1. API System Prompt (`api/bee/decide/route.ts`)
The `gemma4` system prompt will be rewritten to include the core "Impeccable" design laws:
- **Color:** Use OKLCH color spaces exclusively. Avoid pure `#000` or `#fff`; always tint neutrals toward a brand hue.
- **Typography:** Enforce strong hierarchical contrast (&ge;1.25 ratio). Recommend modern editorial/brutalist typefaces.
- **Aesthetic Rules:** Explicit bans on side-stripe borders, decorative gradient text, and default glassmorphism. Push for bold, magazine-like layouts.

### 2. Targeted Mischief Output
When executing a `theme_hack`, the AI will output a JSON structure that specifies exactly which node it is targeting, including `HeroNode`, `TextNode`, and specifically `PromptNode`:

```json
{
  "mischief": "theme_hack",
  "targetNodeId": "prompt-1",
  "cssVars": "--node-bg: oklch(25% 0.05 250); --node-fg: oklch(95% 0.01 250); --node-font: 'Outfit', sans-serif;"
}
```

### 3. Node Integration
The existing React Flow node components must be updated to inherit these variables. If a variable is missing, they should fall back to the global theme default. 

**Affected Nodes:**
- `HeroNode.tsx`
- `TextNode.tsx`
- `PromptNode.tsx` (Ensuring the prompt input fields and structure also adapt to the impeccable styling)

## Verification Plan
1. Check that the API outputs valid OKLCH colors and respects the design bans.
2. Verify that the `<style>` tag injected by `EditorialCanvas.tsx` correctly targets `.react-flow__node[data-id="..."]`.
3. Verify that the nodes visibly change their background, text color, and typography when the swarm executes a target hack.
