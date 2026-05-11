import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useCanvasStore } from '../store/useCanvasStore';

export function useEditorialChat() {
  const [input, setInput] = useState('');
  const isMockApiEnabled = useCanvasStore(state => state.isMockApiEnabled);

  const addPrompt = useCanvasStore(state => state.addPrompt);
  const upsertActiveGhost = useCanvasStore(state => state.upsertActiveGhost);
  const addHero = useCanvasStore(state => state.addHero);
  const addText = useCanvasStore(state => state.addText);

  const { messages, sendMessage, status, stop, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: isMockApiEnabled ? '/api/chat?mock=true' : '/api/chat',
    }),
    onFinish: (event) => {
      return;
      console.log('[DEBUG-FLOW] onFinish called with event:', JSON.stringify(event, null, 2));
      const msg = (event as any).message || event;

      // Parse using msg.parts
      const reasoningParts = msg.parts?.filter((p: any) => p.type === 'reasoning') || [];
      const textParts = msg.parts?.filter((p: any) => p.type === 'text') || [];
      const toolPart = msg.parts?.find((p: any) => p.type?.startsWith('tool-'));

      const finalReasoning = reasoningParts.map((p: any) => p.text).join('') || msg.reasoning || '';
      const finalContent = textParts.map((p: any) => p.text).join('') || msg.content || '';
      const hasToolCall = !!toolPart || !!msg.toolInvocations?.length;

      let toolHeadline = '';
      if (toolPart) {
        toolHeadline = toolPart.input?.headline || toolPart.args?.headline || '';
      } else if (msg.toolInvocations?.[0]) {
        toolHeadline = msg.toolInvocations[0].args?.headline || msg.toolInvocations[0].args?.input?.headline || '';
      }

      // Spawning a text node only if there is no tool call
      if (!hasToolCall && finalContent && finalContent.trim().length > 0) {
        setTimeout(() => {
          addText(finalContent);
        }, 0);
      }

      setTimeout(() => {
        let finalGhostText = "Organizing thoughts...";
        if (hasToolCall && toolHeadline) {
          finalGhostText = toolHeadline;
        } else if (!hasToolCall && finalContent && finalContent.trim().length > 0) {
          finalGhostText = "Output generated.";
        }

        upsertActiveGhost(finalGhostText, true); // true = isFinished
      }, 50);
    },
    async onToolCall({ toolCall }) {
      console.log('[DEBUG-STREAM] onToolCall FIRED!', JSON.stringify(toolCall, null, 2));

      if (toolCall.toolName === 'createNode') {
        let input: any = {};
        try {
          input = (toolCall as any).args || (toolCall as any).input || JSON.parse((toolCall as any).argsText || "{}");
        } catch (e) {
          console.error("Failed to parse tool args", e);
        }
        
        // addHero handles BOTH 'hero' and 'text' types internally via createHeroNode
        addHero(input, toolCall.toolCallId);
        
        // We MUST call addToolOutput here so the tool result is recorded in the local history.
        // Without this, the Vercel AI SDK will throw a "Tool result is missing" error 
        // when we send the NEXT user prompt.
        addToolOutput({
          tool: 'createNode',
          toolCallId: toolCall.toolCallId,
          output: { success: true }
        });
      }
    }
  });

  // Ghost node streaming sync
  // Ghost node streaming sync
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    // 1. If we're waiting for the AI to respond, spawn the ghost node immediately
    if (lastMessage.role === 'user' && status === 'submitted') {
      upsertActiveGhost("Organizing thoughts...", false);
      return;
    }

    // 2. If it's an assistant message, stream the reasoning
    if (lastMessage.role === 'assistant') {
      const reasoningParts = lastMessage.parts?.filter((p: any) => p.type === 'reasoning') || [];
      const textParts = lastMessage.parts?.filter((p: any) => p.type === 'text') || [];
      const toolParts = lastMessage.parts?.filter((p: any) => p.type?.startsWith('tool-')) || [];
      
      const isReasoningFinished = 
        status !== 'streaming' || 
        (reasoningParts.length > 0 && reasoningParts.every((p: any) => p.state === "done")) ||
        textParts.length > 0 ||
        toolParts.length > 0;

      const combinedReasoning = reasoningParts.map((p: any) => p.text).join('');
      
      // Only upsert if we actually have reasoning or if we need to finish the ghost node
      if (combinedReasoning.length > 0 || isReasoningFinished) {
        upsertActiveGhost(combinedReasoning || "Organizing thoughts...", isReasoningFinished);
      }
    }

  }, [messages, status, upsertActiveGhost]);

  // Text node streaming sync
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage?.role === 'user') {
      return
    }

    const textParts = lastMessage.parts?.filter((p: any) => p.type === 'text') || [];
    if (textParts.length === 0) {
      return;
    }
    
    // Text stream is finished if the overall stream isn't streaming, or if the text part is done
    const isTextFinished = status !== 'streaming' || textParts.every((p: any) => p.state === "done");
    
    const combinedText = textParts.map((p: any) => p.text).join('');
    
    if (combinedText.trim().length > 0) {
      addText(combinedText, isTextFinished);
    }
  }, [messages, status, addText]);

  const handleSend = () => {
    if (!input.trim()) return;

    addPrompt(input);
    sendMessage({ text: input });
    setInput('');
  };

  return {
    input,
    setInput,
    handleSend,
    status,
    stop,
    messages
  };
}
