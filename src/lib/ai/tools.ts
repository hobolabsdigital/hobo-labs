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

/**
 * Client-executed tool: suggests 3 follow-up prompts.
 * MUST be called at the very end of the AI's response.
 */
export const suggestPrompts = tool({
  description: 'Suggest exactly 3 context-aware follow-up prompts for the user. MUST be called at the end of your turn.',
  inputSchema: z.object({
    suggestions: z.array(z.string()).length(3)
      .describe('An array of exactly 3 short suggestion strings (max 5-7 words each).')
  }),
});
