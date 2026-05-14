import { convertToModelMessages } from 'ai';

/**
 * Extract the last user query text from core messages.
 */
export function extractUserQuery(coreMessages: Awaited<ReturnType<typeof convertToModelMessages>>): string {
  const lastUserMessage = [...coreMessages].reverse().find(m => m.role === 'user');
  if (!lastUserMessage) return '';

  if (typeof lastUserMessage.content === 'string') {
    return lastUserMessage.content;
  }

  if (Array.isArray(lastUserMessage.content)) {
    return lastUserMessage.content
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join(' ');
  }

  return '';
}
