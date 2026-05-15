# Portfolio Backlog

> Items identified during the v0.1.0 tech debt audit. Tracked here for future milestone planning.

---

## B-001: Cloud Deployment Strategy
**Priority:** High  
**Impact:** Blocks production deployment  

The entire AI pipeline requires a local Ollama instance running Gemma 4. No fallback, no cloud deployment story. Options:
- Add an OpenAI/Anthropic/Google fallback provider
- Deploy Ollama as a sidecar service (e.g., on a GPU instance)
- Add an API proxy that routes to a hosted model

---

## B-002: Test Coverage
**Priority:** Medium  
**Impact:** Reliability  

Only `vectorStore.test.ts` exists (a single, minimal test file). Key areas that need coverage:
- Canvas store actions (node creation, ghost lifecycle, truncation)
- Chat hook message processing and tool call handling
- API route RAG retrieval and sub-agent pipeline
- CRT mode detection and feature gating

---

## B-003: Debug Logging Cleanup
**Priority:** Low  
**Impact:** Code hygiene  

Extensive `console.log` statements throughout (`[DEBUG-STREAM]`, `[DEBUG-FLOW]`, `[SUB-AGENT-TOOL]`, etc.) left from active development. Replace with:
- Structured logger (e.g., pino) with log levels
- Conditional debug mode flag
- Remove or downgrade verbose tool call logging

---

## B-004: Error Boundaries
**Priority:** High  
**Impact:** User experience  

No React error boundaries around critical features. If any of these crash, the entire page dies:
- Canvas (ReactFlow)
- Chat / AI streaming
- CRT WebGL pipeline
- Fluid background WebGL

---

## B-005: AI Response Error States
**Priority:** Medium  
**Impact:** User experience  

Loading/error states for AI responses are limited to the ghost node "Organizing thoughts..." text. Need:
- Error state when Ollama is unreachable
- Timeout handling for long-running sub-agent calls
- Retry mechanism for failed tool calls
- Visual feedback for streaming errors

---

## B-006: Mobile Responsiveness
**Priority:** Medium  
**Impact:** Accessibility  

The canvas, scrubber, and debug panel assume desktop viewports:
- ReactFlow canvas needs touch-friendly controls
- Timeline scrubber drag needs touch event support
- Chat input needs mobile keyboard accommodation
- Debug panel should collapse/hide on small screens

---

## B-007: Chat API Rate Limiting
**Priority:** Medium  
**Impact:** Security  

No rate limiting on the `/api/chat` endpoint. A single user could flood the Ollama instance. Need:
- Per-IP or session-based rate limiting
- Queue management for concurrent requests
- Graceful degradation when Ollama is overloaded

---

## B-008: Canvas Accessibility
**Priority:** Low  
**Impact:** Accessibility  

The ReactFlow canvas is not keyboard-navigable:
- Nodes need focus management
- Timeline scrubber needs keyboard controls
- Screen reader support for node content
- ARIA labels for interactive elements

---

## B-009: Type Node Data Payloads
**Priority:** Medium  
**Impact:** Type safety  

`addHero(data: any)`, `addProject(data: any)`, and node component props all use `data: any`. These should use discriminated union types matching each node type's expected fields (HeroNodeData, TextNodeData, ProjectNodeData, etc.). The simulation ref was already typed — these are the remaining `any` leaks in the canvas pipeline.

---

## B-010: Speed Up Project Creation Node
**Priority:** High  
**Impact:** User Experience  

The project creation node takes too long to spawn/render. Investigate bottlenecks in animation, ReactFlow rendering, or WebGL shader compilation and optimize.

---

## B-011: UI Design Review (Huashu Design)
**Priority:** Medium  
**Impact:** Visual Quality  

Conduct a comprehensive UI design review using the `impeccable` skill, drawing inspiration from [huashu-design](https://github.com/alchaincyf/huashu-design). Look for opportunities to elevate the aesthetic, typography, spacing, and micro-interactions.
