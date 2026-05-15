import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

interface MessagePart {
  type: string;
  text?: string;
  state?: string;
  input?: any;
  args?: any;
  argsText?: string;
  toolName?: string;
  toolCallId?: string;
}

export function useEditorialChat() {
  const [input, setInput] = useState('');
  const isMockApiEnabled = useCanvasStore(state => state.isMockApiEnabled);

  const addPrompt = useCanvasStore(state => state.addPrompt);
  const createGhost = useCanvasStore(state => state.createGhost);
  const updateGhostText = useCanvasStore(state => state.updateGhostText);
  const finishGhost = useCanvasStore(state => state.finishGhost);
  const addHero = useCanvasStore(state => state.addHero);
  const addProject = useCanvasStore(state => state.addProject);
  const addText = useCanvasStore(state => state.addText);
  const timeCursor = useCanvasStore(state => state.timeCursor);
  const truncateHistory = useCanvasStore(state => state.truncateHistory);
  const nodes = useCanvasStore(state => state.nodes);

  // Dossier lifecycle
  const addDossier = useCanvasStore(state => state.addDossier);
  const updateDossierStatus = useCanvasStore(state => state.updateDossierStatus);
  const revealProject = useCanvasStore(state => state.revealProject);

  const { messages, setMessages, sendMessage, status, stop, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: isMockApiEnabled ? '/api/chat?mock=true' : '/api/chat',
    }),
    onFinish: (event) => {
      return;
    },
    onData: (dataPart: any) => {
      // Route dossier progress events from data-dossier stream parts
      if (dataPart?.type === 'data-dossier' && dataPart.data) {
        const { status, slug, title } = dataPart.data;
        switch (status) {
          case 'accessing':
            addDossier(slug);
            break;
          case 'source-loaded':
            updateDossierStatus('source-loaded', { title });
            break;
          case 'rewriting':
            updateDossierStatus('rewriting');
            break;
          case 'complete':
            updateDossierStatus('complete');
            break;
        }
      }
    },
    async onToolCall({ toolCall }) {
      console.log('[DEBUG-STREAM] onToolCall FIRED!', JSON.stringify(toolCall, null, 2));

      let input: any = {};
      try {
        input = (toolCall as any).args || (toolCall as any).input || JSON.parse((toolCall as any).argsText || "{}");
      } catch (e) {
        console.error("Failed to parse tool args", e);
      }

      switch (toolCall.toolName) {
        case 'createHeroNode':
        case 'createNode':
          addHero(input, toolCall.toolCallId);
          break;
        case 'createProjectNode':
          addProject(input, toolCall.toolCallId);
          break;
        case 'showProject': {
          // Server-executed tool — result comes from the sub-agent
          const result = (toolCall as any).result || (toolCall as any).output;
          if (result && !result.error) {
            // Use revealProject to fill the existing skeleton node
            revealProject(result);
          } else if (result?.error) {
            console.warn(`[DEBUG-STREAM] showProject error: ${result.error}`);
          }
          return; // Server already provided output, skip addToolOutput
        }
        default:
          console.warn(`Unhandled tool call: ${toolCall.toolName}`);
          return;
      }

      addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: { success: true }
      });
    }
  });

  // Initial AI Greeting Trigger
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true;
      sendMessage({
        text: "Introduce yourself."
      });
    }
  }, [sendMessage, messages.length]);

  // Ghost node streaming sync
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    // 1. If we're waiting for the AI to respond, spawn the ghost node immediately
    if (lastMessage.role === 'user' && status === 'submitted') {
      createGhost("Organizing thoughts...");
      return;
    }

    // 2. If it's an assistant message, stream the reasoning
    if (lastMessage.role === 'assistant') {
      const reasoningParts = lastMessage.parts?.filter((p: MessagePart) => p.type === 'reasoning') || [];
      const textParts = lastMessage.parts?.filter((p: MessagePart) => p.type === 'text') || [];
      const toolParts = lastMessage.parts?.filter((p: MessagePart) => p.type?.startsWith('tool-')) || [];

      const isReasoningFinished =
        status !== 'streaming' ||
        (reasoningParts.length > 0 && reasoningParts.every((p: MessagePart) => p.state === "done")) ||
        textParts.length > 0 ||
        toolParts.length > 0;

      const combinedReasoning = reasoningParts.map((p: MessagePart) => p.text).join('');

      if (isReasoningFinished) {
        finishGhost(combinedReasoning || "Organizing thoughts...");
        useCanvasStore.getState().setIntroReasoningFinished(true);
      } else if (combinedReasoning.length > 0) {
        updateGhostText(combinedReasoning);
      }
    }

  }, [messages, status, createGhost, updateGhostText, finishGhost]);

  const lastProcessedTextMsgId = useRef<string | null>(null);
  const processedShowProjectCalls = useRef<Set<string>>(new Set());

  // Text node streaming sync
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage?.role === 'user') {
      return
    }

    if (lastProcessedTextMsgId.current === lastMessage.id) {
      // We already fully processed and finalized a text node for this message!
      return;
    }

    const textParts = lastMessage.parts?.filter((p: MessagePart) => p.type === 'text') || [];
    if (textParts.length === 0) {
      return;
    }

    // Text stream is finished if the overall stream isn't streaming, or if the text part is done
    const isTextFinished = status !== 'streaming' || textParts.every((p: MessagePart) => p.state === "done");

    const combinedText = textParts.map((p: MessagePart) => p.text).join('');

    if (combinedText.trim().length > 0) {
      addText(combinedText, isTextFinished);
      if (isTextFinished) {
        lastProcessedTextMsgId.current = lastMessage.id;
      }
    }
  }, [messages, status, addText]);

  // Server-executed tool result watcher (for showProject sub-agent)
  useEffect(() => {
    for (const message of messages) {
      if (message.role !== 'assistant') continue;
      const parts = (message as any).parts || [];
      for (const part of parts) {
        if (
          part.type === 'tool-showProject' &&
          part.state === 'output-available' &&
          part.output &&
          !part.output.error &&
          !processedShowProjectCalls.current.has(part.toolCallId)
        ) {
          processedShowProjectCalls.current.add(part.toolCallId);
          // Use revealProject to fill the skeleton instead of creating new node
          revealProject(part.output);
        }
      }
    }
  }, [messages, revealProject]);

  const handleSend = () => {
    if (!input.trim()) return;

    if (timeCursor !== null) {
      // Branching from history!
      // 1. Truncate visual canvas
      truncateHistory(timeCursor);

      // 2. Truncate AI SDK messages
      // We map the remaining nodes to approximate how many messages should be kept.
      // A simple approximation: keep messages that correspond to the kept nodes.
      // Since it's hard to map exactly, a reliable approach for a portfolio is to count user prompts.
      const nodesToKeep = nodes.slice(0, timeCursor + 1);
      const userPromptCount = nodesToKeep.filter(n => n.type === 'prompt').length;

      let promptIndex = 0;
      let cutIndex = messages.length;
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].role === 'user') {
          promptIndex++;
          if (promptIndex > userPromptCount) {
            cutIndex = i;
            break;
          }
        }
      }

      setMessages(messages.slice(0, cutIndex));
    }

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
