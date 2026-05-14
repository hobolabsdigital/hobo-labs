import { tool } from 'ai';
import { z } from 'zod';

/**
 * Client-executed tool: creates a hero or text node on the editorial canvas.
 * The client's onToolCall handler picks this up and calls addHero/addText.
 */
export const createHeroNode = tool({
  description: 'Create a new hero or text node on the editorial canvas',
  inputSchema: z.object({
    type: z.enum(['text', 'hero']).optional().default('hero')
      .describe('The type of node to create. Defaults to "hero" if omitted.'),
    headline: z.string().optional()
      .describe('Headline for hero nodes. CRITICAL: You MUST use \\\\n to break this text into 2-3 stacked lines (ALL CAPS).'),
    subline: z.string().optional()
      .describe('Subline for hero nodes'),
    text: z.string().optional()
      .describe('Content for text nodes'),
    label: z.string().optional()
      .describe('Small label for text nodes (e.g. CONTEXT, INSIGHT)'),
    animationEffect: z.enum(['none', 'annotation', 'iris']).optional()
      .describe('How to animate the text in'),
    layoutIntent: z.enum(['top_right', 'bottom_right', 'far_right']).optional()
      .describe('Where to spatially drop the node before physics takes over'),
  }),
});
