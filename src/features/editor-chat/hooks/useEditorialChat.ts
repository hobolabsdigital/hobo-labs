import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { dispatchToolCall } from './dispatchToolCall';

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

  const setActiveSuggestions = useCanvasStore(state => state.setActiveSuggestions);
  const clearSuggestions = useCanvasStore(state => state.clearSuggestions);

  const { messages, setMessages, sendMessage, status, stop, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: isMockApiEnabled ? '/api/chat?mock=true' : '/api/chat',
    }),
    onFinish: (event) => {
      return;
    },
    onData: (dataPart: any) => {
      // data-dossier parsing removed
    },
    async onToolCall({ toolCall }) {
      await dispatchToolCall(toolCall, {
        addHero,
        addProject,
        setActiveSuggestions,
        addToolOutput,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Initial AI Greeting Trigger
  // ---------------------------------------------------------------------------
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && messages.length === 0) {
      hasInitialized.current = true;
      sendMessage({
        text: "Introduce yourself."
      });
    }
  }, [sendMessage, messages.length]);

  // ---------------------------------------------------------------------------
  // Ghost node streaming sync
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Text node streaming sync
  // ---------------------------------------------------------------------------
  const lastProcessedTextMsgId = useRef<string | null>(null);
  const processedShowProjectCalls = useRef<Set<string>>(new Set());

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

  // ---------------------------------------------------------------------------
  // Send Logic — handles time-travel truncation and dispatches to the AI
  // ---------------------------------------------------------------------------
  const sendPromptText = (text: string) => {
    if (!text.trim()) return;

    if (timeCursor !== null) {
      // Branching from history — truncate canvas and AI message history
      truncateHistory(timeCursor);

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

    addPrompt(text);
    clearSuggestions();
    sendMessage({ text });
  };

  const handleSend = () => {
    sendPromptText(input);
    setInput('');
  };

  const submitPrompt = (text: string) => sendPromptText(text);

  return {
    input,
    setInput,
    handleSend,
    submitPrompt,
    status,
    stop,
    messages
  };
}
