# Impeccable Bees Design Spec

## Overview
Evolve the "Mischievous Bees" AI swarm into a constructive, autonomous design intelligence by injecting the "Impeccable" design skill guidelines directly into their AI decision prompt. 

The swarm retains its chaotic mischievous nature, but acts as a highly critical art director. It will critique its own (or existing) node styles and layouts against the Impeccable guidelines, and then fix them. 

## Scope
This design covers upgrading the AI prompt, enhancing the layout heuristics, adding visual animations for style changes, and improving the Playground debug controls.

## Architecture & Implementation

### 1. API System Prompt (`api/bee/decide/route.ts`)
The `gemma4` system prompt will enforce a unique, two-step "Dr. Jekyll and Mr. Hyde" thought process:
1. **Chaotic Generation:** The AI will first act as the mischievous bee, generating a chaotic, random, or "ugly" style without any impeccable skills.
2. **Impeccable Review:** The AI will then act as the strict art director, evaluating its own chaotic creation against the core "Impeccable" design laws stolen from the Antigravity `impeccable` skill.
3. **Critique & Output:** The AI prints its critique of the chaotic design to the swarm terminal, and then outputs the *corrected*, premium JSON payload.

**Impeccable Design Laws Injected:**
- **Color:** Use OKLCH color spaces exclusively. Avoid pure `#000` or `#fff`; always tint neutrals toward a brand hue.
- **Typography:** Enforce strong hierarchical contrast (&ge;1.25 ratio). Recommend modern editorial/brutalist typefaces.
- **Aesthetic Rules:** Explicit bans on side-stripe borders, decorative gradient text, and default glassmorphism. Push for bold, magazine-like layouts.

### 2. Smart Heuristics for Layout (`float_nodes`)
The mathematical rules in `Swarm.tsx` for nudging nodes will be upgraded. Instead of randomly pushing nodes out of alignment, the swarm will nudge nodes toward a strict underlying mathematical grid or align them neatly with their neighbors.

### 3. Visual Feedback (Collapse Animation)
React Flow node components (`HeroNode.tsx`, `TextNode.tsx`, `PromptNode.tsx`) will use Framer Motion to watch for changes to their injected CSS variables. 
When a `theme_hack` targets a node:
1. The text content will rapidly scale down (collapse) to `0`.
2. The new fonts and colors will be applied while hidden.
3. The text will spring back to full size (`scale: 1`) to reveal the new impeccable style.

### 4. Playground Override Controls (`DebugPanel.tsx`)
The Swarm Controls will be expanded:
- **"Override AI Checkbox":** Locks the swarm into the manually selected behavior, preventing the AI from changing it on the next tick.
- **"Force Brain Tick":** A button that immediately fires the `api/bee/decide` route so developers don't have to wait 60 seconds to test behavior.

## Verification Plan
1. Check that the API outputs critiques followed by valid OKLCH colors that respect the design bans.
2. Verify that clicking "Force Brain Tick" immediately triggers the stream.
3. Verify the collapse/spring animation triggers correctly on targeted nodes.
4. Verify `float_nodes` pushes the layout into a cleaner grid rather than chaos.
