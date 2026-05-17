---

version: alpha
name: Google Labs
description: A minimalist yet vibrant hub for AI experiments, characterized by bold typography, playful geometry, and Google's primary color palette applied to rounded card systems.
colors:
  primary: "#1a73e8"
  accent-blue: "#5E9BFF"
  accent-purple: "#8F9AFF"
  accent-pink: "#FFB1EE"
  accent-orange: "#FF8E59"
  accent-lime: "#DAEF68"
  surface: "#ffffff"
  text-primary: "#000000"
  text-secondary: "#5f6368"
typography:
  family-sans: "Google Sans"
  family-text: "Google Sans Text"
  family-mono: "Space Mono"
  family-cursive: "Cedarville Cursive"
  h1:
    family: "{typography.family-sans}"
    weight: 500
    size: 4rem
  body-md:
    family: "{typography.family-text}"
    weight: 400
    size: 1.6rem
spacing:
  unit: 8px
  container-max: 1440px
rounded:
  sm: 0.4rem
  md: 2rem
  lg: 3.6rem
  full: 9999rem
components:
  button:
    radius: "{rounded.full}"
    padding: 1.5rem 3.1rem
    font: "{typography.family-sans}"
    weight: 500
  card-business:
    radius: "{rounded.md}"
    padding: 1.4rem
  card-interactive:
    radius: "{rounded.lg}"

---

##
 Overview

Google Labs presents a visual identity that balances Google's established corporate cleanliness with the experimental, high-energy nature of AI. The site uses a high-density grid of cards, each color-coded to denote different experiments. Motion is a core cue; video previews trigger on hover, and custom SVG "masks" (flowers, hexagons, and blobs) frame images to create an organic, non-technical feel. The layout is spacious and responsive, transitioning from fluid swiper-based carousels on mobile to stable grids on desktop.
##
 Colors

The color strategy uses a base of white and light gray, punctuated by a specific set of "experimental" pastels and brights.
-
 
**
Primary Blue (#1a73e8)
**
: Used for utility actions, cookie banners, and standard links.
-
 
**
Experimental Palette
**
: Cards utilize specific background colors like Lavender (#8F9AFF), Sky Blue (#5E9BFF), Bubblegum (#FFB1EE), Coral (#FF8E59), and Lime (#DAEF68).
-
 
**
Contrast
**
: Text primarily appears in Black (#000000) for maximum readability against high-chroma backgrounds.
##
 Typography

The typography relies heavily on the 
**
Google Sans
**
 family.
-
 
**
Google Sans
**
: Used for headlines and button text, providing a geometric, friendly aesthetic.
-
 
**
Google Sans Text
**
: Employed for longer body copy and metadata to ensure legibility at smaller scales.
-
 
**
Space Mono
**
: Used for technical or data-driven accents, emphasizing the "Labs" and coding aspect of the experiments.
-
 
**
Cedarville Cursive
**
: Appears as a rare decorative accent for humanistic, handwritten-style cues.
##
 Layout

The site is built on a responsive grid system that prioritizes horizontal scanning.
-
 
**
Carousels
**
: Swiper.js is used for experiment lists, allowing users to flick through large sets of content.
-
 
**
Business Cards
**
: A fixed-ratio grid of horizontal cards for secondary demos.
-
 
**
Full-Image Media Cards
**
: Vertical cards that use a 70% top padding strategy to create a large visual surface area.
-
 
**
Footer
**
: A massive, typographic footer that spans the full width of the viewport, prioritizing navigation and team links.
##
 Elevation & Depth

Elevation is used sparingly. Most components rely on flat color fills rather than shadows to define boundaries.
-
 
**
Cookie Bar
**
: One of the few elements with a distinct shadow (
`0 2px 3px 0 rgba(60,64,67,.3)`
).
-
 
**
Button Hover
**
: Buttons utilize a pseudo-element expansion (
`:after`
) that scales up from the center to fill the button background on hover, creating a feeling of depth without using shadows.
-
 
**
Card Interaction
**
: The use of video overlays on image hover provides a temporal layer of depth.
##
 Shapes

Geometry is a primary differentiator for the site.
-
 
**
Masks
**
: Images are clipped using custom SVG masks: 
`Flower.svg`
, 
`Gum.svg`
, 
`Hexagon.svg`
, and 
`Square.svg`
. These shapes are intentionally irregular to feel like "experimental" blobs.
-
 
**
Pill Shapes
**
: Buttons and CTAs use a 5rem or larger border-radius to create a perfect pill shape.
-
 
**
Container Curves
**
: Large feature cards use 3.6rem or 6rem corner radii to feel soft and approachable.
##
 Components

-
 
**
Experiment Cards
**
: Large blocks with solid background colors, featuring an image masked in an irregular shape and a white or black pill button.
-
 
**
Video Lightbox
**
: A full-screen overlay component used for viewing video demos, with high-contrast close and navigation controls.
-
 
**
GL Buttons
**
: Highly customized buttons with an animated hover state that scales a background element to fill the frame.
-
 
**
Footer Navigation
**
: A multi-column link system that organizes deep navigation into clear vertical lists.
##
 Do's and Don'ts

-
 
**
Do
**
: Use high-contrast black text on the pastel experimental background colors.
-
 
**
Do
**
: Use the specific SVG masks (Flower, Gum, Hexagon) to frame imagery.
-
 
**
Do
**
: Maintain the generous 3.6rem corner radii on large cards.
-
 
**
Don't
**
: Introduce heavy dropshadows or gradients on cards.
-
 
**
Don't
**
: Use standard sans-serif fonts where Google Sans is expected.
-
 
**
Don't
**
: Overcomplicate the spacing; stick to the 8px base unit.
##
 Accessibility

-
 
**
High Contrast
**
: Explicit CSS rules for 
`forced-colors: active`
 are implemented in the cookie bar and buttons to support high-contrast mode users.
-
 
**
Interactive Targets
**
: Buttons maintain a minimum height of 48px to meet touch-target standards.
-
 
**
Keyboard Navigation
**
: Buttons include specific 
`:focus`
 states with 2px solid outlines or shadows to ensure visibility.
-
 
**
Semantic Markers
**
: The use of 
`aria-label`
 on social links (X, newsletter) ensures screen reader users understand destination context.
##
 Assets

-
 
**
Other
**
: https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500
&amp;
family=Google+Sans+Text:wght@400;500
&amp;
display=block
-
 
**
Font
**
: https://fonts.gstatic.com/s/cedarvillecursive/v18/yYL00g_a2veiudhUmxjo5VKkoqA-B_nuIrpw.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPh0UvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPhEUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi0UvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi4UvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi8UvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiAUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiIUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPikUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiMUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPioUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiQUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPisUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiYUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj0UvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj4UvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj8UvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjAUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjEUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjIUvQ.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjkUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjMUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjsUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjwUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjYUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPlwUvaYr.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVngZjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnkdjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnktjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmdjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmFjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmhjtg.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmljtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmNjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmpjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmRjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmtjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmVjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmxjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmZjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnn5jtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnnBjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnndjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnnFjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnnhjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnnJjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnnljtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnnNjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnnpjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnnRjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnnVjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnnxjtiu7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qCR2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qEF2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qEh2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qEl2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qEN2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qEp2iw.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qER2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qEV2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qEZ2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qF52i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qFB2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qFd2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qFF2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qFJ2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qFN2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qFx2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qFZ2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/googlesanstext/v25/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qGl2i1dC.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/materialicons/v145/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/materialsymbolsoutlined/v335/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/spacemono/v17/i7dPIFZifjKcF5UAWdDRYE58RWq7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/spacemono/v17/i7dPIFZifjKcF5UAWdDRYE98RWq7.woff2
-
 
**
Font
**
: https://fonts.gstatic.com/s/spacemono/v17/i7dPIFZifjKcF5UAWdDRYEF8RQ.woff2
-
 
**
Image
**
: https://labs.google/assets/images/masks/Flower.svg
-
 
**
Image
**
: https://labs.google/assets/images/masks/Gum.svg
-
 
**
Image
**
: https://labs.google/assets/images/masks/Hexagon.svg
-
 
**
Image
**
: https://labs.google/assets/images/masks/Square.svg
-
 
**
Image
**
: https://labs.google/assets/images/tools/ai-edge-eloquent.webp
-
 
**
Image
**
: https://labs.google/assets/images/tools/flow-music.webp
-
 
**
Image
**
: https://labs.google/assets/images/tools/foodMood.webp
-
 
**
Image
**
: https://labs.google/assets/images/tools/gentype.webp
-
 
**
Image
**
: https://labs.google/assets/images/tools/moving-scripts.webp
-
 
**
Image
**
: https://labs.google/assets/images/tools/NationalGalleryMixtape_Labs.webp
-
 
**
Image
**
: https://labs.google/assets/images/tools/saywhatyousee1.webp
-
 
**
Image
**
: https://labs.google/assets/images/tools/stitch.webp
-
 
**
Image
**
: https://labs.google/assets/images/tools/TalkingTours_Labs_Thumbnail_01.webp
-
 
**
Image
**
: https://labs.google/assets/images/tools/vantage.webp
-
 
**
Video
**
: https://labs.google/assets/videos/ai-edge-eloquent.mp4
-
 
**
Video
**
: https://labs.google/assets/videos/flow-music.mp4
-
 
**
Video
**
: https://labs.google/assets/videos/moving-scripts.mp4
-
 
**
Video
**
: https://labs.google/assets/videos/stitch.mp4
-
 
**
Video
**
: https://labs.google/assets/videos/vantage.mp4",
  "notes": "The DESIGN.md focuses on the Google Labs design system, emphasizing its distinct experimental palette, custom SVG masking for imagery, and the core use of Google Sans typography within a responsive card-based architecture."
}
-
 
**
Other
**
: https://fonts.gstatic.com/s/googlesans/v67/%3C!--%20Source%20HTML%20slice%202/5%20(chars%2064336-84186 — contexts: html inline style url()