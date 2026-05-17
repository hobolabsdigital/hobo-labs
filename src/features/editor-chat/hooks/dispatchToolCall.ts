import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

interface ToolDispatchDeps {
  addHero: ReturnType<typeof useCanvasStore.getState>['addHero'];
  addProject: ReturnType<typeof useCanvasStore.getState>['addProject'];
  setActiveSuggestions: ReturnType<typeof useCanvasStore.getState>['setActiveSuggestions'];
  addToolOutput: (opts: { tool: string; toolCallId: string; output: unknown }) => void;
}

/**
 * Parse tool call input from the various formats the SDK may provide.
 */
function parseToolInput(toolCall: any): Record<string, unknown> {
  try {
    return toolCall.args || toolCall.input || JSON.parse(toolCall.argsText || '{}');
  } catch {
    console.error('Failed to parse tool args');
    return {};
  }
}

/**
 * Dispatch a tool call to the appropriate canvas action.
 * Returns a Promise<void> so `useChat`'s `onToolCall` can await it.
 */
export async function dispatchToolCall(
  toolCall: { toolName: string; toolCallId: string },
  deps: ToolDispatchDeps,
) {
  const input = parseToolInput(toolCall);

  switch (toolCall.toolName) {
    case 'createHeroNode':
    case 'createNode':
      deps.addHero(input, toolCall.toolCallId);
      break;

    case 'createProjectNode':
      deps.addProject(input, toolCall.toolCallId);
      break;

    case 'suggestPrompts':
      deps.setActiveSuggestions((input as any).suggestions);
      break;

    case 'showProject': {
      const slug = (input as any).slug;
      if (!slug) return;

      try {
        const res = await fetch(`/api/project-data?slug=${slug}`);
        const data = await res.json();
        if (data && !data.error) {
          deps.addProject(data, toolCall.toolCallId);
          deps.addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output: data });
        } else {
          if (process.env.NODE_ENV !== 'production') console.warn('[showProject] error:', data.error);
          deps.addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output: { error: data.error } });
        }
      } catch (err: any) {
        if (process.env.NODE_ENV !== 'production') console.error('[showProject] fetch error:', err);
        deps.addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output: { error: err.message } });
      }
      return; // showProject handles its own addToolOutput
    }

    default:
      console.warn(`Unhandled tool call: ${toolCall.toolName}`);
      return;
  }

  deps.addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output: { success: true } });
}
