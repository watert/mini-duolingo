import { create } from 'zustand';
import { PinyinItem, GameMode } from '../types';

interface GameState {
  // --- Core Session Data ---
  queue: PinyinItem[][]; // Items are processed in chunks (groups)
  currentGroupIndex: number;
  
  // --- Meta ---
  courseTitle: string;
  isMistakeMode: boolean;
  inRetryPhase: boolean;
  status: 'idle' | 'playing' | 'completed';
  mode: GameMode; // determines which view to render

  // --- Tracking ---
  sessionMistakes: PinyinItem[];
  allMistakes: PinyinItem[];
  startTime: number;

  // --- Actions ---
  initGame: (items: PinyinItem[], courseTitle: string, isMistakeMode: boolean) => void;
  resetGame: () => void;
  
  // Logic Signals (called by views)
  recordMistake: (item: PinyinItem) => void;
  advanceRound: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Defaults
  queue: [],
  currentGroupIndex: 0,
  courseTitle: '',
  isMistakeMode: false,
  inRetryPhase: false,
  status: 'idle',
  mode: 'match',
  
  sessionMistakes: [],
  allMistakes: [],
  startTime: 0,

  initGame: (items, courseTitle, isMistakeMode) => {
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    
    // Create Chunks of 4
    const chunks: PinyinItem[][] = [];
    for (let i = 0; i < shuffledItems.length; i += 4) {
      chunks.push(shuffledItems.slice(i, i + 4));
    }

    if (chunks.length === 0) return;

    // Set initial state
    set({
      queue: chunks,
      currentGroupIndex: 0,
      sessionMistakes: [],
      allMistakes: [],
      startTime: Date.now(),
      courseTitle,
      isMistakeMode,
      inRetryPhase: false,
      status: 'playing',
    });

    determineModeForGroup(chunks[0], set);
  },

  resetGame: () => {
    set({ status: 'idle', queue: [] });
  },

  recordMistake: (item) => {
    const { sessionMistakes, allMistakes } = get();
    // Add to session mistakes if not already there
    if (!sessionMistakes.some(m => m.word === item.word)) {
      set({ sessionMistakes: [...sessionMistakes, item] });
    }
    // Add to all mistakes log if not already there
    if (!allMistakes.some(m => m.word === item.word)) {
      set({ allMistakes: [...allMistakes, item] });
    }
  },

  advanceRound: () => {
    const { currentGroupIndex, queue, inRetryPhase, sessionMistakes } = get();
    
    // Check if we have more groups in current queue
    const nextIdx = currentGroupIndex + 1;
    
    if (nextIdx < queue.length) {
      set({ currentGroupIndex: nextIdx });
      determineModeForGroup(queue[nextIdx], set);
    } else {
      // End of Queue
      if (!inRetryPhase && sessionMistakes.length > 0) {
        // Start Retry Phase
        const uniqueMistakes = Array.from(new Set(sessionMistakes)) as PinyinItem[];
        const mistakeChunks: PinyinItem[][] = [];
        for (let i = 0; i < uniqueMistakes.length; i += 4) {
          mistakeChunks.push(uniqueMistakes.slice(i, i + 4));
        }

        set({
          inRetryPhase: true,
          queue: mistakeChunks,
          currentGroupIndex: 0,
          sessionMistakes: [] // Clear for next pass
        });
        determineModeForGroup(mistakeChunks[0], set);
      } else {
        // Game Over
        set({ status: 'completed' });
      }
    }
  }
}));

// Helper to determine next mode based on data and probability
const determineModeForGroup = (group: PinyinItem[], set: any) => {
  const canQuiz = group.every(item => item.options && item.options.length >= 3);
  // ~20% chance for Quiz mode if data supports it
  const mode: GameMode = canQuiz && Math.random() < 0.2 ? 'quiz' : 'match';
  set({ mode });
};
