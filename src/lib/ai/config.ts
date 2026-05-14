import { ollama } from 'ai-sdk-ollama';
import { wrapLanguageModel, extractReasoningMiddleware } from 'ai';

/** Sampling parameters shared across main and sub-agent */
export const SAMPLING_CONFIG = {
  temperature: 1.0,
  topP: 0.95,
  topK: 64,
} as const;

/**
 * Create the primary model with optional reasoning.
 * Reasoning is disabled for the initial greeting to reduce latency.
 */
export function createModel(enableReasoning: boolean) {
  return ollama('gemma4', {
    think: enableReasoning,
    options: {
      temperature: SAMPLING_CONFIG.temperature,
      top_p: SAMPLING_CONFIG.topP,
      top_k: SAMPLING_CONFIG.topK,
    },
  });
}

/**
 * Wrap a model with reasoning extraction middleware.
 * Gemma 4 uses `<think>` tags for chain-of-thought.
 */
export function withReasoning(model: ReturnType<typeof createModel>) {
  return wrapLanguageModel({
    model,
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
  });
}
