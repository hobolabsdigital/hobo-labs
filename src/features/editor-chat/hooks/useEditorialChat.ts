import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { ARCHIVE_THRESHOLD } from '@/features/canvas/constants';
import { dispatchToolCall } from './dispatchToolCall';

interface MessagePart {
  type: string;
  text?: string;
  state?: string;
  input?: unknown;
  args?: unknown;
  argsText?: string;
  toolName?: string;
  toolCallId?: string;
}

const FALLBACK_PROMPT_COUNT = 5;
const FALLBACK_PROMPT_MAX_LENGTH = 80;

function messageText(message: UIMessage): string {
  return (message.parts || [])
    .map(part => (part.type === 'text' ? part.text : ''))
    .join('');
}

/** Flattens the UI message list into the shape /api/summarize expects */
function toSummaryPayload(messages: UIMessage[]) {
  return messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, text: messageText(m).trim() }))
    .filter(m => m.text.length > 0);
}

/** Used when /api/summarize is unreachable — archiving must never be blocked by it */
function buildFallbackSummary(messages: UIMessage[]): string {
  const prompts = messages
    .filter(m => m.role === 'user')
    .map(m => messageText(m).trim())
    .filter(text => text.length > 0)
    .slice(0, FALLBACK_PROMPT_COUNT)
    .map(text => text.length > FALLBACK_PROMPT_MAX_LENGTH
      ? `${text.slice(0, FALLBACK_PROMPT_MAX_LENGTH).trimEnd()}…`
      : text);

  if (prompts.length === 0) return 'Earlier conversation covered: an introduction.';
  return `Earlier conversation covered: ${prompts.join('; ')}`;
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
  const addContact = useCanvasStore(state => state.addContact);
  const addText = useCanvasStore(state => state.addText);
  const timeCursor = useCanvasStore(state => state.timeCursor);
  const truncateHistory = useCanvasStore(state => state.truncateHistory);
  const nodes = useCanvasStore(state => state.nodes);

  const archiveEpoch = useCanvasStore(state => state.archiveEpoch);
  const setIsArchiving = useCanvasStore(state => state.setIsArchiving);
  const isArchiving = useCanvasStore(state => state.isArchiving);
  const viewingEpochId = useCanvasStore(state => state.viewingEpochId);

  const setActiveSuggestions = useCanvasStore(state => state.setActiveSuggestions);
  const clearSuggestions = useCanvasStore(state => state.clearSuggestions);

  const { messages, setMessages, sendMessage, status, stop, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: isMockApiEnabled ? '/api/chat?mock=true' : '/api/chat',
    }),
    onFinish: () => {
      return;
    },
    onData: () => {
      // data-dossier parsing removed
    },
    async onToolCall({ toolCall }) {
      await dispatchToolCall(toolCall, {
        addHero,
        addProject,
        addContact,
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

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    // Assistant-only — the epoch seed is a system message and must not spawn a text node
    if (lastMessage?.role !== 'assistant') {
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
  // Epoch archiving — folds a full context window into a chapter and reseeds
  // ---------------------------------------------------------------------------
  const isArchivingRef = useRef(false);

  useEffect(() => {
    if (status !== 'ready') return;
    if (messages.length < ARCHIVE_THRESHOLD) return;
    if (viewingEpochId !== null) return;
    if (isArchivingRef.current) return;

    isArchivingRef.current = true;
    const archived = messages;

    const run = async () => {
      setIsArchiving(true);

      let summary = '';
      try {
        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: toSummaryPayload(archived) }),
        });
        if (res.ok) {
          const data = await res.json() as { summary?: string };
          summary = data.summary?.trim() || '';
        }
      } catch {
        summary = '';
      }

      if (!summary) summary = buildFallbackSummary(archived);

      archiveEpoch({ summary, messages: archived });

      // System role keeps the seed out of the time-travel branch-cut math,
      // which counts user messages against prompt-node counts.
      setMessages([{
        id: `epoch-seed-${Date.now()}`,
        role: 'system',
        parts: [{
          type: 'text',
          text: `Context: this conversation continues from an earlier chapter. Summary of that chapter: ${summary}`,
        }],
      }]);

      setIsArchiving(false);
      isArchivingRef.current = false;
    };

    void run();
  }, [status, messages, viewingEpochId, archiveEpoch, setIsArchiving, setMessages]);

  // ---------------------------------------------------------------------------
  // Send Logic — handles time-travel truncation and dispatches to the AI
  // ---------------------------------------------------------------------------
  const sendPromptText = (text: string) => {
    if (!text.trim()) return;
    if (viewingEpochId !== null || isArchiving) return;

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
    messages,
    isArchiving
  };
}
