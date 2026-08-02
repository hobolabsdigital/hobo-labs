import { StateCreator } from 'zustand';
import type { CanvasState } from '../useCanvasStore';
import type { Node, Edge } from '@xyflow/react';
import type { UIMessage } from 'ai';

const TITLE_MAX_LENGTH = 28;

export interface Epoch {
  id: string;
  index: number;
  title: string;
  summary: string;
  nodes: Node[];
  edges: Edge[];
  messages: UIMessage[];
  endedAt: number;
}

export interface EpochSlice {
  epochs: Epoch[];
  viewingEpochId: string | null;
  isArchiving: boolean;

  setIsArchiving: (v: boolean) => void;
  setViewingEpoch: (id: string | null) => void;
  archiveEpoch: (args: { summary: string; messages: UIMessage[] }) => void;
}

function messageText(message: UIMessage): string {
  return (message.parts || [])
    .map(part => (part.type === 'text' ? part.text : ''))
    .join('');
}

function deriveTitle(messages: UIMessage[], index: number): string {
  const firstPrompt = messages
    .filter(m => m.role === 'user')
    .map(m => messageText(m).trim())
    // The auto-sent greeting trigger is not a real visitor prompt
    .find(text => text.length > 0 && text !== 'Introduce yourself.');

  if (!firstPrompt) return `Chapter ${index}`;

  return firstPrompt.length > TITLE_MAX_LENGTH
    ? `${firstPrompt.slice(0, TITLE_MAX_LENGTH).trimEnd()}…`
    : firstPrompt;
}

export const createEpochSlice: StateCreator<CanvasState, [], [], EpochSlice> = (set) => ({
  epochs: [],
  viewingEpochId: null,
  isArchiving: false,

  setIsArchiving: (v: boolean) => set({ isArchiving: v }),
  setViewingEpoch: (id: string | null) => set({ viewingEpochId: id }),

  archiveEpoch: ({ summary, messages }) => {
    set(state => {
      const index = state.epochs.length + 1;
      const epoch: Epoch = {
        id: `epoch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        index,
        title: deriveTitle(messages, index),
        summary,
        nodes: state.nodes,
        edges: state.edges,
        messages,
        endedAt: Date.now(),
      };

      // Clearing nodes also resets the rightward-growing layout origin — intended.
      return {
        epochs: [...state.epochs, epoch],
        nodes: [],
        edges: [],
        timeCursor: null,
        lastPlacedNodeId: null,
        activeGhostId: null,
        activeGhostText: null,
        activeStreamingTextId: null,
        activeStreamingText: null,
        trackedNodeId: null,
        viewingEpochId: null,
      };
    });
  },
});
