import { create } from 'zustand';

export type MischiefType = 'invert' | 'float_nodes' | 'buzz_text' | 'theme_hack' | 'none';
export type BrainMode = 'worker' | 'soldier';

export interface BeeData {
  id: string;
  type: BrainMode;
  mood: 'happy' | 'mischievous' | 'angry';
  position: { x: number; y: number };
  velocity: { x: number; y: number };
}

interface BeeState {
  bees: Record<string, BeeData>;
  activeMischief: MischiefType;
  terminalText: string;
  themeOverrides: Record<BrainMode, Record<string, string>>;
  swarmTarget: Record<BrainMode, string | 'global' | null>;
  brainMode: BrainMode; // Selected mode in debug panel
  manualOverride: boolean;
  forceTick: Record<BrainMode, number>;
  visitedNodes: string[];
  isSleeping: boolean;
  setMischief: (type: MischiefType) => void;
  setIsSleeping: (sleeping: boolean) => void;
  setTerminalText: (text: string | ((prev: string) => string)) => void;
  setThemeOverrides: (mode: BrainMode, styles: Record<string, string>) => void;
  setSwarmTarget: (mode: BrainMode, target: string | 'global' | null) => void;
  setBrainMode: (mode: BrainMode) => void;
  setManualOverride: (override: boolean) => void;
  triggerForceTick: (mode: BrainMode) => void;
  addVisitedNode: (id: string) => void;
  clearVisitedNodes: () => void;
  updateBee: (id: string, data: Partial<BeeData>) => void;
  addBees: (count: number, type: BrainMode) => void;
}

export const useBeeStore = create<BeeState>((set) => ({
  bees: {},
  activeMischief: 'none',
  terminalText: '',
  themeOverrides: { worker: {}, soldier: {} },
  swarmTarget: { worker: null, soldier: null },
  brainMode: 'worker',
  manualOverride: false,
  forceTick: { worker: 0, soldier: 0 },
  visitedNodes: [],
  isSleeping: false,
  setMischief: (activeMischief) => set({ activeMischief }),
  setIsSleeping: (isSleeping) => set({ isSleeping }),
  setTerminalText: (text) => set((state) => ({ 
    terminalText: typeof text === 'function' ? text(state.terminalText) : text 
  })),
  setThemeOverrides: (mode, styles) => set((state) => ({ 
    themeOverrides: { ...state.themeOverrides, [mode]: styles } 
  })),
  setSwarmTarget: (mode, target) => set((state) => ({ 
    swarmTarget: { ...state.swarmTarget, [mode]: target } 
  })),
  setBrainMode: (brainMode) => set({ brainMode }),
  setManualOverride: (manualOverride) => set({ manualOverride }),
  triggerForceTick: (mode) => set((state) => ({ 
    forceTick: { ...state.forceTick, [mode]: state.forceTick[mode] + 1 }
  })),
  addVisitedNode: (id) => set((state) => ({ visitedNodes: [...state.visitedNodes, id] })),
  clearVisitedNodes: () => set({ visitedNodes: [] }),
  updateBee: (id, data) => set((state) => ({
    bees: {
      ...state.bees,
      [id]: { ...state.bees[id], ...data }
    }
  })),
  addBees: (count, type) => set((state) => {
    const newBees: Record<string, BeeData> = { ...state.bees };
    // count current bees of this type to offset the ID
    const currentCount = Object.values(state.bees).filter(b => b.type === type).length;
    
    for (let i = 0; i < count; i++) {
      const id = `bee_${type}_${currentCount + i}`;
      newBees[id] = {
        id,
        type,
        mood: 'happy',
        position: { 
          x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 500, 
          y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 500 
        },
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4
        }
      };
    }
    return { bees: newBees };
  })
}));
