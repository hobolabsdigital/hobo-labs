# Architectural Decisions Log

> This file persists context across AI coding sessions. Read this FIRST before making changes.
> Append new decisions at the bottom. Never delete entries — mark superseded ones with ~~strikethrough~~.

---

## Project Identity

- **App**: Editorial portfolio — an AI-powered interactive canvas where visitors explore projects
- **Aesthetic**: Brutalist, Bauhaus-inspired. Raw typography, high contrast, deliberate imperfection
- **Stack**: Next.js (App Router) + ReactFlow + Framer Motion + Zustand + Vercel AI SDK
- **LLM**: Local Ollama — currently `gemma4:31b-cloud` (previously `deepseek-v4-pro:cloud`)
- **Theme system**: CSS variables with dark/light toggle. Three identities: default, Cyberpunk, Blueprint

## Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── api/chat/route.ts   # Main AI streaming endpoint (agent mode)
│   ├── api/project-data/   # Structured object streaming for ProjectNode
│   ├── api/suggestions/    # Dynamic prompt suggestions
│   └── api/project-context/# RAG context retrieval
├── core/                   # Shared UI, theme, utils
├── features/
│   ├── canvas/             # ReactFlow editorial canvas (main viewport)
│   │   ├── components/nodes/  # IntroNode, ProjectNode, TextNode, HeroNode, etc.
│   │   ├── store/useCanvasStore.ts  # Zustand — nodes, edges, physics
│   │   ├── store/nodeFactories.ts   # Node creation helpers
│   │   └── hooks/useEditorialPhysics.ts  # D3 force simulation
│   ├── editor-chat/        # Sidebar chat UI + streaming hook
│   ├── project-modal/      # Full-screen project expansion overlay
│   │   └── store/useProjectModalStore.ts
│   ├── entry/              # Intro animation sequence
│   ├── crt/                # Experimental CRT shader overlay
│   └── fluid-bg/           # WebGL fluid background
└── lib/
    ├── ai/config.ts        # Model configuration (Ollama)
    └── vectorStore.ts       # pgvector-based RAG
```

## Key Decisions

### D001 — StreamText + Output.object over StreamObject (2025-05-15)
**Context**: ProjectNode needs structured JSON (title, role, year, image, etc.) streamed from the LLM.
**Decision**: Use `streamText` with `Output.object()` instead of `streamObject`. The deprecated `streamObject` had reliability issues with local models.
**Rationale**: Modern Vercel AI SDK pattern. Better compatibility with Ollama. Reasoning/chain-of-thought disabled for structured data tasks to reduce TTFT.

### D002 — Flying Hero over layoutId for Modal Transitions (2025-05-16)
**Context**: Expanding a ProjectNode card into a full-screen modal needs a cinematic transition.
**Decision**: Manual coordinate-based "flying hero" animation instead of Framer Motion `layoutId`.
**Rationale**: `layoutId` broke inside ReactFlow's transformed coordinate space. The flying hero captures the source `getBoundingClientRect()`, stores it in `useProjectModalStore`, and animates an explicit `motion.img` from source to destination. Reverse-flight on close.
**Supersedes**: Three prior approaches — (1) layoutId, (2) WebGL shader displacement with html-to-image, (3) Three.js fold transition.

### D003 — D3 Force Physics with High Friction (2025-05-14)
**Context**: Nodes on the editorial canvas need organic, drifting layout.
**Decision**: D3 force simulation with `velocityDecay: 0.82` and soft directional forces.
**Rationale**: Lower friction caused rubber-banding. Higher friction prevents aggressive snapping while maintaining organic feel. Nodes flow L→R in a linear interaction hierarchy.

### D004 — Disable Chain-of-Thought for Structured Tasks (2025-05-15)
**Context**: Local LLM was slow to respond for project data generation.
**Decision**: `think: false` for structured data extraction, `think: true` only for conversational agent mode.
**Rationale**: CoT adds 2-5s latency for tasks that don't benefit from reasoning. Structured schema tasks just need fast JSON output.

### D005 — Gallery Deduplication via Word Intersection (2025-05-15)
**Context**: Hero image from ProjectNode was duplicating in the modal gallery slider.
**Decision**: Word-intersection heuristic to detect and remove duplicate hero images from gallery.
**Rationale**: URL comparison wasn't sufficient — same image could have different CDN paths. Fuzzy string matching on filenames/alt text was more reliable.

### D006 — CSS Variable Theming over Tailwind (ongoing)
**Context**: Project uses Tailwind but core aesthetic relies on CSS custom properties.
**Decision**: Design tokens live in CSS variables. Tailwind utilities used for layout, but colors/typography reference variables.
**Rationale**: Brutalist aesthetic requires precise control. Theme switching (dark/light/cyberpunk/blueprint) done via variable swapping on `:root`.

### D007 — SVG Timeline Scrubber with Dynamic viewBox (2025-05-13)
**Context**: Interactive timeline for node history on the canvas.
**Decision**: SVG-based scrubber with dynamic viewBox scaling. Expanded hit-boxes for drag interaction.
**Rationale**: CSS-based approaches had coordinate space distortion. SVG viewBox scales crisp at any viewport height.

### D008 — Prompt Suggestions as Solid Pills with mix-blend-difference (2025-05-12)
**Context**: Chat UI needs dynamic AI-generated prompt suggestions.
**Decision**: Horizontal scrollable pills with `mix-blend-difference` for color inversion. Fetched from `/api/suggestions` endpoint. Persistent queue of 3.
**Rationale**: Blend mode ensures readability against any background. Pills cycle as used — always 3 visible.

## User Preferences (Emile)

- Prefers **explicit, coordinate-based animations** over magic layout abstractions
- Values **empirical debugging** — evidence before fixes, never speculate
- Wants **brutalist, raw aesthetic** — not polished/corporate
- Dislikes optimistic agreement — "push back if my logic is flawed"
- Uses Ollama for local LLM inference — latency matters
- Monorepo with apps/portfolio as the main workspace
- Uses both this IDE (Antigravity) and Gemini CLI

### D009 — AABB Velocity-Based Collision over d3.forceCollide (2026-05-18)
**Context**: Nodes were overlapping after spawn; forceCollide wasn't resolving collisions between wide rectangular cards.
**Decision**: Custom `forceAABB` force modifying `vx/vy` (velocity), not `x/y` (position). Per-type bounding boxes from `NODE_DIMS` in `constants.ts`.
**Rationale**: D3 integrates velocity into position each tick — writing directly to `x/y` gets overwritten on the next integration step, causing snap-back. Velocity modifications persist through integration. Collision detection uses `x + vx` (predicted position) matching D3 internals.
**File**: `src/features/canvas/hooks/forceAABB.ts`

### D010 — Link Distance Cap to Prevent Off-Screen Drift (2026-05-18)
**Context**: Nodes were being pushed hundreds of px off-screen by the x-flow force because link strength (0.05) was too weak to oppose it.
**Decision**: `LINK_MAX_DISTANCE = 800` constant. Link force acts as a spring that becomes attractive once separation exceeds 800px. Strength bumped from 0.05 → 0.3.
**Rationale**: The link force must be strong enough to resist `x-flow` at max drift. The cap prevents runaway separation without clamping positions directly (which fights D3 integration).
**Files**: `src/features/canvas/constants.ts`, `src/features/canvas/hooks/useEditorialPhysics.ts`

### D011 — Hero Slot Image is a Measurement Anchor, Never Visible (2026-05-18)
**Context**: The hero slot `<img>` in `ProjectModalOverlay` was bleeding through behind the gallery slider when the slider translated off it.
**Decision**: `opacity: 0` always on the hero slot `<img>`. It exists only so `heroSlotRef.getBoundingClientRect()` gives the flying hero a landing coordinate.
**Rationale**: The flying hero (`motion.img`) provides the visual pre-settle. The slider provides it post-settle. The hero slot img is a structurally necessary but visually invisible element. Any opacity toggle tied to `currentIndex` races with the slider spring animation.
**File**: `src/features/project-modal/components/ProjectModalOverlay.tsx`

### D012 — Component Modularization (2026-05-19)
**Context**: `ProjectModalOverlay` and `DebugPanel` grew beyond 250 lines and mixed concerns.
**Decision**: Extract presentational subcomponents into `features/{feature}/components/` subdirectories (`GallerySlider`, `ProjectDetails`, `CrtDebugControls`, etc.)
**Rationale**: Adherence to SOLID principles and a strict 250-line file limit to maintain project maintainability and developer experience.

### D013 — Contact Node Configuration (2026-05-19)
**Context**: User requested a seamless way for the AI to share their contact credentials on the canvas.
**Decision**: Update `prompts.ts` to hardcode contact credentials (email/phone) and instruct the AI to use the `showContact` tool with them.
**Rationale**: The `ContactNode` component and `showContact` tool already existed but weren't fully utilized. Giving the AI explicit credentials ensures accurate, branded responses when the user's contact information is requested.

### D014 — Front door rebuilt as a static, shader-led portfolio; AI canvas moved to /lab (2026-09-28)
**Context**: The site wasn't converting. The home route opened on a theme-picker gate, then an empty canvas that only filled if a visitor chatted with the digital twin (LLM-dependent, slow, blank for crawlers and link previews). Titles/OG were generic ("Editorial Canvas Portfolio"), the latest work (Nutrons) was absent, and MonstoryX was described as a UE5 game rather than the agentic platform the CVs lead with.
**Decision**: `/` is now a statically prerendered page (`src/app/(site)`), content-first, in the same design system as the CV (Blueprint) and cover letters (Signal) — five themes, switchable, tokens in `src/app/(site)/styles/tokens.css`. The old canvas lives on unchanged at `/lab` under its own root layout (`src/app/(lab)`), so neither route's global CSS can leak into the other (navigating between them is a full page load by design).
**Hero**: hand-written WebGL2 fragment shader (`src/features/site/gl/`), no three.js: one domain-warped noise field, printed as ordered-dither riso layers outside a cursor lens and drawn as a contour plan inside it ("a thousand frames, ten on brand, I build the filter"). Scroll grows the lens to fill the frame. Palette is read from the theme's `--gl-*` tokens and crossfades on theme change. Adaptive resolution, pauses off-screen, static frame under reduced motion, CSS dot-field fallback without WebGL2.
**Content**: all copy in `src/features/site/content.ts`, sourced from the 2026-09 CVs and letters — keep every figure measured. Nutrons frames were captured from the Figma hub file (`public/work/nutrons/`).
**Gotcha**: a live WebGL context can stall `document.startViewTransition` capture under software GL (seen with headless SwiftShader). Theme switching freezes the shader during the transition and bails to `skipTransition()` + direct commit after 400 ms, so the theme always applies.

### D015 — Orchestration gets its own sheet (§05), figures from the platform repo (2026-09-28) — ~~the counts~~ superseded by D018
**Context**: Emile's edge is how he runs agents, not just that he uses them. The Method sheet compressed it into one line ("owner agents hired by paths, blind critics, memory as the bus, every decision an ADR").
**Decision**: New section `Orchestration` (`src/features/site/components/Orchestration.tsx`, copy in `ORCHESTRATION` in `content.ts`, styles in `styles/orchestration.css`). It shows the ticket → spec → owner → build → critic → re-check → merge flow (the Finale `Pipeline` component, now generic), an animated gauntlet figure, the counts, and four cards. Sheets renumber off `SECTIONS`, and `SHEET_COUNT` feeds every "NN / NN".
**Sources**: facts and counts come from the MonstoryX lead session, measured 2026-09-28: 62 ADRs, 51 merged PRs, 110 of ~511 tickets done, 807 test files, 11 owner charters, 1–3 rounds per change. They supersede the CV's 36 ADRs and 1,569 commits, and the Receipts now use 62 ADRs and 2,006 commits on main.
**Accuracy rules**: Ruflo is the memory bus and hook layer, not the executor. Don't claim swarm_init, the neural layer, witness or daemon workers as part of the daily loop. Owner routing is manual (the lead reads paths against the charters). impeccable runs as a per-edit hook, not a PR gate. The UX skill set is "intent". There is no "taste" skill, so don't name one. No model names in site copy.
**Gotcha**: every animated part of the gauntlet figure is opacity/transform only. A mix of main-thread (background colour) and compositor animations drifted out of sync under load, which showed a "pass" stamp beside a single failed round.

### D016 — Motion layer: reveal variants + scroll-linked CSS, no JS animation library (2026-09-28)
**Decision**: All motion is in `src/app/(site)/styles/motion.css`. It hangs off one IntersectionObserver in `PageChrome`, which sets `data-revealed` plus a `--reveal-delay`. That delay cascades each batch in DOM order and is removed after it has played, so hover transitions aren't late.
**Variants** (`data-reveal` value):
- default: fade up
- `lines`: headlines rise out of per-line masks
- `rule`: sheet-head rule draws, then its words
- `stagger`: the container stays and its children cascade
- `content`: for hairline-grid cells, the cell stays and its contents cascade
- `.plate`: the frame lands, then a paper shutter with a red scan line slides off the image
- work preview: it can't be hovered, so it lands in duotone and develops to full colour after 0.3s (the plates keep hover-to-colour)
- `.pipeline`: the rail draws and the nodes pop
The hero headline plays the line rise as a CSS load animation, so it never waits on hydration.
**Scroll-linked** (only under `prefers-reduced-motion: no-preference` and `@supports (animation-timeline: view())`): plate images drift, method numerals drift, and a top scroll meter. Browsers without scroll timelines get the reveals only. (Two full-bleed tape bands between sheets shipped briefly and were removed at Emile's request; don't reintroduce banners.)
**Rules**:
- Animate only opacity, translate, rotate and scale. Animating clip-path over large images repainted every frame and stalled software GL.
- Use `overflow: clip`, not `hidden`, on anything wrapping a `view()` subject. `hidden` makes a scroll container and strands the timeline, so `.plate__img` is clip.
- Never fade a cell whose grid draws its 1px rules as the container background; it flashes that colour as a solid block. Use `content`.
**Verified**: timelines bind (View/ScrollTimeline). Everything reveals after a slow walk down the page. No horizontal overflow at 1440 or 390. Zero scroll animations under reduced motion, and zero hidden elements with JS off.

### D017 — MonstoryX told as the product, with a scroll-scrubbed quest (2026-09-28)
**Copy**: the section now leads with what MonstoryX is: a language-learning game for primary children with a teacher platform behind it. The principle is that AI never reaches the child, and answers are judged by code. The description is sourced from the MonstoryX lead session. A Web Summit Lisbon 2026 stamp (ALPHA startup, Impact startup, 9–12 Nov) links to the lis26 appearance page.
**Fig. 3.0**: `QuestSequence.tsx` plus `styles/quest.css`. It shows the five teacher screens of one real quest ("Learning Shapes") and then the student game.
- Layout is CSS-only: pinned under `.js` + no-preference, a static grid otherwise, so there's no hydration shift.
- JS feeds an eased `--p` and the current step. Each card's transform is a pure function of `--p` and its index (`--t`, `--e` fly-in, `--d` sink).
- Cards are opaque almost at once; translucent cards in flight read as a double exposure.
- Phones deal cards from the side, so a card in flight never covers the caption.
- The video loads only from step 4 and plays only while it's the top card and on screen. It's muted with a sound toggle; reduced motion and no-JS get native controls.
**Assets**:
- Screens: cropped from Emile's window captures to the app viewport, which removes his browser chrome, bookmarks and the Next.js dev badge. Stored at `public/work/monstoryx/01–05-*.jpg` (1800w, q92).
- Video: `MonstoryXGame.mov` is 1280×736, 75fps, 1:48. Encoded to H.264 30fps CRF 24 faststart (21 MB) with a poster at 92s, both on Emile's Higgsfield CDN. Deleting those uploads breaks Fig. 3.0.
**Fig. 3.2 (added the same day)**: `FinaleFilm.tsx`, a real Finale pipeline output ("Learning Shapes", 40 s), sits beside its six storyboard pictures.
- A cut list with a playhead and the current shot stay in step with playback; clicking a shot seeks to it.
- The film plays muted while at least half is on screen, never under reduced motion.
- Shot starts are the film's measured cuts: 0, 2.97, 6.9, 12.1, 18.13, 23.2.
- Assets are in-repo at `public/work/monstoryx/finale/` (3.9 MB mp4, poster, six stills).
- Finding for the platform: the source render's video track is 29.5 s but its audio is 40.2 s. The web copy holds the last frame (tpad clone) so picture and sound end together. Worth checking the Finale assembly step.

### D018 — One page per sheet; process counts come off the site (2026-09-29)
**Context**: Colleague feedback: one page that "goes on and on" (the front door measured 26.6 screens at 1440×900 and 38.3 at 390×844), and too many numbers. Agencies and clients don't buy commits, test counts, ADR totals or "3/3". They buy the quality of the code, the orchestration and the products.
**Decision**: the site is a drawing set of five pages, one per sheet, registered in `SHEETS` (`content.ts`): 01 `/` general arrangement (hero, latest work as two case cards, Method, contact), 02 `/work/nutrons`, 03 `/work/monstoryx`, 04 `/orchestration`, 05 `/work` (full archive + parts list). Every page renders through `SiteShell`: nav, the sheet, a "next sheet" hand-on (02 → 05; the front page has none), and Contact, whose title block names the sheet. The front page is now 6.2 screens on desktop and 7.9 on a phone.
**Numbering**: a page title carries its sheet number (§02 Nutrons); sections within a page are decimals (§01.1, §05.1). Figures follow the sheet (Orchestration is Fig. 4.x).
**Numbers policy**: the Receipts grid and the Orchestration stats are gone. ADR, PR, ticket, test, line and commit counts, calibration scores, timings and thresholds are rewritten as what the check does. The rig's stat block became "What that buys a client". Numbers stay only where they describe a product or a client outcome (three worlds, +18% conversion, 1M+ impressions). Don't reintroduce counters.
**Gotchas**:
- Next 16 no longer drops CSS `scroll-behavior: smooth` for route changes. `<html data-scroll-behavior="smooth">` opts back in, so a new sheet lands at its top instead of gliding there.
- Metadata merges shallowly, so every sheet restates openGraph and twitter (`sheetMetadata` in `metadata.ts`). The `opengraph-image` file convention never reaches a page that sets openGraph, so the share card is a plain `public/og.png`, declared once.
- `PageChrome` is keyed by sheet, so reveals re-arm after a client-side navigation. The sheet tab stays down while a `[data-sheet-quiet]` block (the hero) holds the middle of the screen.
- Phones: nav links become a `<details>` "Sheets" index (`NavIndex`), which also carries both CVs. The CV chip is hidden under 760px so the bar fits at 360.

### D019 — Nutrons gameplay film, in the repo, plays only in view (2026-09-29)
**What**: Fig. 2.1 on `/work/nutrons` is `GameplayFilm.tsx`, an edited Canopy Run gameplay showreel (title card, pick a hero, the three worlds, Base Camp, "One more run?"). It sits under the "Shipped" heading, above the stills; those renumbered to 2.2–2.6, and the Figma plates to 2.7–2.10.
**Asset**: the source is Emile's Drive upload (57 s, 1920×1080, 60 fps, no audio, 94 MB). The web encode is `public/work/nutrons/gameplay.mp4`: 1280×720 at 60 fps, x264 `-preset slow -tune animation -crf 28`, faststart, no audio track, 12.6 MB. 60 fps costs almost nothing over 30 on this footage, and the side-scrolling judders at 30. The poster is the title card at 1.5 s (`gameplay-poster.jpg`).
**Behaviour**: `preload="none"`, so nothing downloads until the film is half on screen. It then loops muted and pauses off screen. Under reduced motion it never loads by itself: poster plus native controls. There's no sound toggle because there's no audio.
**Gotcha**: Playwright's Chromium has no H.264 decoder (`canPlayType('video/mp4; codecs="avc1…"')` is empty), so every mp4 on the site reports NETWORK_NO_SOURCE there. To test playback, route the mp4 URL to a VP8 webm copy inside the test. Don't "fix" it by shipping webm.

### D020 — Hero copy fits the frame's height on desktop (2026-09-30)
**Context**: `.hero__copy` stacks up from 96px above the foot, and the headline scales with the width only. On short desktop frames the aside climbed into the meter and the nav: Blueprint at 1280×720, 1366×768 and 1440×810, the other four themes (bigger display type) up to 1536×864, and Sunset even at 1440×900.
**Decision**: three rules in `styles/hero.css`, desktop only (above 900px wide; phones are untouched).
- The headline's font size is capped by the height the frame can spare: `(frame − --copy-top − 96px − --copy-rows − --copy-aside) / (3 × --display-lh + 0.32)`. The divisor is the headline's height in ems (three lines, 0.08em of knock-out padding each, two 0.04em gaps), so the cap holds in every theme. `--copy-aside` is the tallest aside, Sunset's (244px long, 167px short), with a margin.
- Short or wide frames (`max-height: 880px`, or `min-aspect-ratio: 9/5`, which catches a 1080p screen minus the browser chrome): the meter moves left, as on phones, so the aside can rise to the registration marks. The kicker shares the aside's row.
- Laptop heights (`max-height: 780px`) use the short intro, as phones do.
1440×900 and 1920×1080 keep the original arrangement. Blueprint keeps its full headline size at every listed size. The other themes shrink it by up to 15% where the cap binds, most at 1440×810 and 1440×900.
**Gotcha**: if the aside's copy, padding or CTAs grow, raise `--copy-aside` too, or the stack climbs back into the nav. The lens tag still rides above everything (z-index 3), so it can sit over the aside's first line; that was already true at these sizes.
**Verified**: Playwright + SwiftShader, all five themes, 1280×720 to 2560×1440 plus 901×600 and 1000×560: no overlap between meter, aside, kicker, nav or headline. Phone numbers (390×844, 360×800) are identical to before.
