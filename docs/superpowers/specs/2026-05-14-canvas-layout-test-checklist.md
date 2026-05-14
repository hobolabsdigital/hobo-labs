# Canvas Layout & Camera Redesign — Test Checklist

> Run through after `npm run dev` on `localhost:3001`. Check each box as you go.

## 1. Initial Load
- [x] Hero node renders within ~900px width (no horizontal overflow)
- [x] Camera starts centered on the hero area (not zoomed way out showing empty canvas)
- [x] Intro animation plays, then camera pans to hero node smoothly
- [x] Post-intro uses `fitView` to show all spawned nodes with padding

## 2. Text Response Constraints
- [x] Ask a broad question (e.g. "what is your work process?")
- [x] AI response is ≤3 paragraphs (system prompt constraint working)
- [x] TextNode height is capped at ~280px with bottom-fade gradient
- [x] No scrollbar appears inside the TextNode

## 3. Ghost Node (Reasoning)
- [x] During `[ THINKING... ]` phase, reasoning text stays within ~160px viewport
- [x] Top of reasoning text fades out as new text pushes in from bottom
- [x] After reasoning finishes, node collapses to `[ + REASONING ]` badge
- [x] Click badge → full reasoning shows in scrollable container (max 300px)
- [x] Click badge again → collapses back to badge

## 4. Hero Node Sizing
- [x] Ask the AI to create a hero headline (or trigger initial greeting)
- [x] If AI writes a long headline, it wraps instead of extending to 1400px+
- [x] Headline text uses 2-3 stacked lines (prompt constraint)

## 5. Project Node — Compact Card + Dossier Reveal
- [x] Ask "show me the MonstoryX project" (or any project)
- [x] Dossier terminal spawns → **compact** skeleton card spawns (image shimmer + title/role shimmers)
- [x] Dossier progress updates stream in (source loaded, rewriting, complete)
- [x] Skeleton fills with data → dossier collapses to badge
- [x] After reveal, card is **compact** format: hero image + title + role + quote
- [x] Compact card is ~800px wide (not 1500px tall)
- [x] Hover shows `[ CLICK TO EXPAND ]` hint (expand = future WebGL modal)

## 6. D3 Physics — No Overlaps
- [x] After 2-3 interactions, nodes are visually separated (not piled on top of each other)
- [x] Project cards don't overlap text or ghost nodes
- [x] Nodes tend to flow left-to-right from the hero (newer nodes further right)
- [x] Dragging a node → it stays roughly where you drop it (high friction, no rubber-band)

## 7. Camera Tracking
- [x] When a new node spawns, camera smoothly pans to it (not fitView of everything)
- [x] Camera zooms to 0.7 for project cards, 0.9 for text/ghost
- [x] During ghost streaming, camera follows without jittering
- [x] **Manual pan breaks tracking**: drag the canvas → camera stops auto-following
- [x] New node spawned after manual pan → tracking resumes to that node
- [x] Camera tracking suppressed during intro animation

## 8. Timeline Scrubber
- [x] Timeline scrubber still works (fitView is preserved for time travel)
- [x] Scrubbing to a past point → camera fitViews all visible nodes at that time
- [ ] Returning to present → camera behavior normal

## 9. Multi-Turn Conversation
- [x] Have a 4-5 turn conversation with the AI
- [x] Canvas remains navigable (not a tangled mess of overlapping nodes)
- [x] Left-to-right flow is visible — newer interactions are further right
- [x] Camera doesn't fight itself (no rapid zoom in/out oscillation)

---

## Backlog — Future Phases

### High Priority
- [ ] **WebGL Project Modal**: Click compact card → WebGL distortion transition → full project spread opens as viewport-level modal (decoupled from canvas nodes)
- [ ] **Physics fine-tuning session**: Live-test with 5+ turn conversations to validate current soft settings (0.82 decay, -80 charge, 0.04 forceX) don't cause overlap at scale

### Medium Priority
- [ ] **Persistent node positions**: Save/restore node positions so returning visitors see a stable canvas
- [ ] **Responsive camera**: Adjust zoom levels for smaller screens (tablet, mobile)
- [ ] **Timeline return-to-present**: Fix camera behavior when returning from history scrubbing to present state

### Low Priority / Polish
- [ ] **Node entrance animations**: Subtle fade-in or scale-up when new nodes spawn
- [ ] **Edge styling refinement**: Evaluate if dotted curved edges are the right aesthetic vs. straight muted lines
- [ ] **Swarm sleep/wake**: Resume swarm agent integration with the sleep state for performance during AI responses

## Current Physics Config (reference)

```
physicsConfig: {
  velocityDecay: 0.82,     // High friction — nodes stop quickly
  chargeStrength: -80,     // Weak repulsion
  linkDistance: 400,        // Edge target length
  linkStrength: 0.05,      // Very weak edge pull
  linkIterations: 1,       // Minimal constraint solving
}
forceX: 0.04              // Gentle L→R suggestion
forceY: 0.01              // Nearly invisible vertical centering
alphaTarget on reheat: 0.05 for 500ms
collide radii: hero=300, project=350, text=160, ghost=100, dossier=100
```

## Known Tweakables
If something feels off but isn't broken:
- `velocityDecay` — increase toward 0.9 for more friction, decrease toward 0.6 for more drift
- `chargeStrength` — increase magnitude for more separation, decrease for tighter clustering
- `forceX` strength (0.04) — increase for stronger L→R pull, decrease for more organic
- `forceX` column spacing (350px) — increase if nodes still overlap horizontally
- `collide` radii — increase per-type if nodes still visually overlap
- TextNode `maxHeight` (280px) — adjust if fade cuts too much or too little
- GhostNode streaming viewport (160px) — adjust based on readability
- Camera zoom levels (0.7 / 0.9) — adjust based on screen size
