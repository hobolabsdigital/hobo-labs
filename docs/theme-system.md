# Theme System Architecture

## Overview

The portfolio uses a multi-theme design system with four distinct visual identities. Themes are not cosmetic color swaps; each has its own typography, geometry, grid treatment, and component-level styling.

Themes are managed by `@wrksz/themes` (class-based) and switched at runtime via the Playground panel.

## Registered Themes

| Theme | Background | Accent | Typography | Geometry | Grid |
|-------|-----------|--------|------------|----------|------|
| **Light** | `#faf9f7` warm off-white | `#1a73e8` blue | Inter (sans) | Rounded (2rem input bar, pill suggestions) | 5% black lines |
| **Dark** | `#0a0a0c` tinted charcoal | `#5E9BFF` blue | Inter (sans) | Rounded | 5% white lines |
| **Blueprint** | `#f0ede6` warm parchment | `#2a3db5` cobalt | Space Mono (monospace, forced) | Sharp-edged, crosshair cursor | 6% cobalt lines + body grid |
| **Cyberpunk** | `#0c0612` purple-black | `#ff2d7b` fuchsia | Saira Condensed (compressed gothic) | Sharp-edged | 6% fuchsia lines + scanlines |

### Design Decisions

- **Blueprint is NOT "dark navy + neon cyan."** That's the first-order AI reflex for "blueprint." Instead: committed cobalt-on-cream, like architectural drafting paper from Sutera.ch.
- **Cyberpunk is NOT "neon green monospace."** Fuchsia-on-purple-black with a compressed gothic (Saira Condensed), not a monospace terminal cliché.
- **Each theme overrides `--font-sans`** to force its typeface across all components using `!important`. This means every `font-sans` utility becomes theme-aware automatically.

## Architecture

```
@wrksz/themes (class-based, SSR-safe)
  ↓
ThemeProvider in layout.tsx
  themes={['light', 'dark', 'blueprint', 'cyberpunk']}
  attribute="class"
  ↓
<html class="light|dark|blueprint|cyberpunk">
  ↓
CSS custom properties resolve per-class
  ↓
Components read via var(--background), var(--foreground), etc.
```

### Type Safety

```typescript
// src/core/theme/theme-provider.tsx
export type AppTheme = "light" | "dark" | "blueprint" | "cyberpunk" | "system"

export function useTheme() {
  return useThemeBase<AppTheme>()
}
```

All theme consumers import `useTheme` from `@/core/theme/theme-provider` (not from `@wrksz/themes` directly). This ensures the `AppTheme` union is enforced at compile time.

### Adding a New Theme

1. **Define CSS variables** in `globals.css` under a new class (e.g., `.retrowave { ... }`)
2. **Add a `@custom-variant`** at the top of `globals.css`: `@custom-variant retrowave (&:is(.retrowave *))`
3. **Add body-level styles** if needed (background textures, cursors)
4. **Extend the `AppTheme` union** in `src/core/theme/theme-provider.tsx`
5. **Register in `ThemeProvider`** in `layout.tsx`: `themes={[..., 'retrowave']}`
6. **Add to `THEME_OPTIONS`** in `DebugPanel.tsx`
7. **Handle in theme-aware components**: `ChatInput.tsx`, `InteractiveGrid.tsx`, `HeroText.tsx`, logo styles in `globals.css`

## Key Files

### Theme Infrastructure

| File | Role |
|------|------|
| `src/app/globals.css` | CSS custom properties per theme, `@custom-variant` declarations, grid/body/logo overrides |
| `src/core/theme/theme-provider.tsx` | `AppTheme` type union, typed `useTheme()` wrapper |
| `src/app/layout.tsx` | Font imports (Inter, Space Mono, Saira Condensed), `ThemeProvider` config |
| `src/features/canvas/components/DebugPanel.tsx` | Playground panel with 2×2 theme selector grid |

### Theme-Aware Components

| File | What adapts |
|------|------------|
| `src/features/editor-chat/components/ChatInput.tsx` | Suggestion pill shape, input bar geometry, send button style |
| `src/core/ui/InteractiveGrid.tsx` | Canvas crosshair color and opacity |
| `src/features/entry/components/HeroText.tsx` | Hero gradient vs. solid color |
| `src/app/globals.css` (`.theme-logo`) | Logo color and blend mode per theme |
| `src/features/entry/components/EnterLab.tsx` | Intro box gradients via `--box-*-bg` variables |

## CSS Variable System

### Core Variables (all themes must define)

```css
--background     /* Page background */
--foreground     /* Primary text color */
--primary        /* Accent/interactive color */
--border         /* Border color */
--input          /* Input background */
--ring           /* Focus ring color */
```

### Optional Variables

```css
--hero-gradient  /* Hero text gradient (cyberpunk) or 'none' (blueprint) */
--hero-clip      /* background-clip override for hero text */
--hero-fill      /* -webkit-text-fill-color override */
--box-1-bg       /* EnterLab intro box backgrounds */
--box-2-bg
--box-3-bg
--box-text        /* EnterLab text color */
--box-border      /* EnterLab border color */
```

### Font Variables

```css
--font-sans      /* Overridden per theme: Inter (default), Space Mono (blueprint), Saira Condensed (cyberpunk) */
--font-mono      /* Monospace stack */
--font-display   /* Display font (Saira Condensed) — available globally but only forced in cyberpunk */
```

## Theme-Specific Textures

### Blueprint

- **Body grid**: 80px cobalt lines at 6% opacity
- **Cursor**: `crosshair` on body, buttons, inputs
- **Intro boxes**: Transparent background, cobalt outlines only
- **Logo**: Solid cobalt (#2a3db5), no blend mode

### Cyberpunk

- **Scanlines**: 2px horizontal repeating gradient at 3% fuchsia opacity
- **Intro boxes**: Fuchsia→deep-red, amber→orange, cyan→blue gradients
- **Logo**: Hot fuchsia (#ff2d7b), no blend mode
- **Hero gradient**: Fuchsia→amber horizontal

### Light / Dark

- **Logo**: White with `mix-blend-mode: difference` (inverts against any background)
- **No body textures**

## Theme Switching UI

The theme selector lives inside the Playground drawer (`DebugPanel.tsx`), not as a standalone toggle. This was a deliberate choice: themes are experimental/development tools, not a user-facing preference.

```
┌─────────────────────┐
│ THEME               │
│ ┌─────┐  ┌─────┐   │
│ │LIGHT│  │ DARK│   │
│ └─────┘  └─────┘   │
│ ┌─────────┐┌──────┐│
│ │BLUEPRINT││CYBER ││
│ │// REAL  ││// PUNK│
│ └─────────┘└──────┘│
│ NODE PHYSICS        │
│ ...                 │
└─────────────────────┘
```

Active theme gets inverted fill (foreground bg, background text). Inactive themes show as outlined buttons.

## Contrast Ratios (Verified)

All theme combinations pass WCAG AA (4.5:1 minimum for normal text):

| Theme | Element | Ratio | Status |
|-------|---------|-------|--------|
| Light | Text on background | 12.10:1 | ✅ AA |
| Dark | Text on background | 10.84:1 | ✅ AA |
| Blueprint | Cobalt on cream | 6.37:1 | ✅ AA |
| Cyberpunk | Fuchsia on purple-black | 5.63:1 | ✅ AA |
| Cyberpunk | Foreground on background | 15.57:1 | ✅ AA |

## Known Issues

- **CRT shader conflict**: The CRT chromatic aberration effect may interact aggressively with fine grid lines in cyberpunk mode at high shader intensity.
- **Theme toggle manual updates**: Adding a new theme requires updating `THEME_OPTIONS` in `DebugPanel.tsx`, the `AppTheme` union in `theme-provider.tsx`, and the `themes` array in `layout.tsx`. Consider centralizing to a single config file.
- **Suggestion touch targets**: Blueprint pills are ~24px tall, below the 44px WCAG 2.2 target. All themes need increased vertical padding.
- **Focus indicators**: Suggestion buttons lack `focus-visible` rings for keyboard navigation.
