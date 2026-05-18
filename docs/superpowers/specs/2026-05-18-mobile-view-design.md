# Mobile View Design Spec

## Goal
Adapt the existing 2D ReactFlow editorial canvas into a responsive, highly usable mobile interface. The mobile version will use a "Unified Stream" vertical feed layout, merging the AI chat interface and the generated project cards into a single chronological scrolling view.

## Core Architectural Decisions

### 1. Viewport Branching
The application will branch rendering strategies based on screen width.
- Desktop (`min-width: 768px`): Renders the existing `ReactFlow` canvas with D3 physics.
- Mobile (`max-width: 767px`): Renders the new `MobileStreamView` DOM tree.
- State: Both views share the identical underlying state from `useCanvasStore`, meaning nodes, node types, and data remain universally consistent.

### 2. The Unified Stream Layout (`MobileStreamView`)
Instead of a separate chat sidebar and open canvas, mobile devices will display a single full-screen vertical flex column.
- **Node Mapping:** The array of nodes from `useCanvasStore` will be mapped sequentially.
- **Text Nodes / Prompt Nodes:** Will appear as chat bubbles or raw editorial text blocks with brutalist typography in the vertical stream.
- **Project Nodes / Hero Nodes:** Will render as full-bleed, edge-to-edge cards. Content within the project cards (title, role, summary) will stack vertically.

### 3. Chat Input Position
The chat input will be pinned to the bottom of the viewport (`position: sticky` or `fixed` at `bottom-0`).
- **Prompt Suggestions:** The dynamic solid pill suggestions will horizontally scroll immediately above the text input.
- **Visuals:** The input wrapper will use a background matching the active theme's background variable, potentially with a `backdrop-filter` for glassmorphism, ensuring that text scrolling behind it does not cause readability issues.

### 4. Data Flow & Auto-Scroll
- **Hydration:** As the backend `streamText` populates data into `useCanvasStore`, the `MobileStreamView` will reactively re-render, hydrating the mobile layout in real-time.
- **Auto-Scrolling:** A `useRef` attached to the bottom of the stream will ensure that as the AI types and new nodes are appended, the viewport automatically scrolls to keep the active generation in view.

### 5. Transitions & The Project Modal
- **Desktop vs. Mobile Modal:** The complex "flying hero" coordinate transition used on desktop is omitted on mobile to preserve performance.
- **Mobile Expansion:** Tapping a project card in the stream will trigger a standard Framer Motion `slide-up` or `fade-in` transition, expanding the card to reveal the full gallery slider component.
- **State:** The `useProjectModalStore` will still manage the active/open state for the gallery view.

### 6. Theming
- The mobile implementation will strictly use existing CSS variables (`var(--bg)`, `var(--fg)`, `var(--primary)`) to ensure the Default, Cyberpunk, and Blueprint identities apply perfectly without duplication of CSS utility classes.
