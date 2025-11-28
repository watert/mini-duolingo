
import { create } from 'zustand';
import { QuizItem, MistakeItem } from '../types';
import { generateQuizOptions } from './quizLogic';
import * as CommonData from '../data/pinyin-common';

interface GameState {
  // --- Core Session Data ---
  queue: QuizItem[]; 
  currentIndex: number;
  
  // --- Meta ---
  courseTitle: string;
  isMistakeMode: boolean;
  inRetryPhase: boolean;
  status: 'idle' | 'playing' | 'completed';

  // --- Tracking ---
  sessionMistakes: MistakeItem[];
  allMistakes: MistakeItem[];
  startTime: number;

  // --- Actions ---
  initGame: (queue: QuizItem[], courseTitle: string, isMistakeMode: boolean) => void;
  resetGame: () => void;
  
  // Logic Signals (called by views)
  recordMistake: (item: MistakeItem) => void;
  advanceRound: () => void;
}

// Helper to get fallback distractors
const getFallbackDistractors = (): string[] => {
  // Grab a few random pinyins from level 1 common data
  const sample = CommonData.level1
    .slice(0, 10)
    .map(i => 'pinyin' in i ? i.pinyin : '')
    .filter(p => p !== '');
    
  return sample.sort(() => Math.random() - 0.5).slice(0, 3);
};

export const useGameStore = create<GameState>((set, get) => ({
  // Defaults
  queue: [],
  currentIndex: 0,
  courseTitle: '',
  isMistakeMode: false,
  inRetryPhase: false,
  status: 'idle',
  
  sessionMistakes: [],
  allMistakes: [],
  startTime: 0,

  initGame: (queue, courseTitle, isMistakeMode) => {
    set({
      queue,
      currentIndex: 0,
      sessionMistakes: [],
      allMistakes: [],
      startTime: Date.now(),
      courseTitle,
      isMistakeMode,
      inRetryPhase: false,
      status: 'playing',
    });
  },

  resetGame: () => {
    set({ status: 'idle', queue: [] });
  },

  recordMistake: (item) => {
    const { sessionMistakes, allMistakes } = get();
    // Add to session mistakes if not already there
    if (!sessionMistakes.some(m => m.question === item.question)) {
      set({ sessionMistakes: [...sessionMistakes, item] });
    }
    // Add to all mistakes log if not already there
    if (!allMistakes.some(m => m.question === item.question)) {
      set({ allMistakes: [...allMistakes, item] });
    }
  },

  advanceRound: () => {
    const { currentIndex, queue, inRetryPhase, sessionMistakes } = get();
    
    const nextIdx = currentIndex + 1;
    
    if (nextIdx < queue.length) {
      set({ currentIndex: nextIdx });
    } else {
      // End of Queue
      if (!inRetryPhase && sessionMistakes.length > 0) {
        // Start Retry Phase
        // Convert mistakes into a new queue
        const retryQueue: QuizItem[] = [];
        
        // Strategy: 1 Quiz per mistake
        sessionMistakes.forEach(m => {
          let options = m.options;
          // If options are missing (e.g. error from Match mode), provide fallbacks
          if (!options || options.length === 0) {
             options = getFallbackDistractors();
          }

          retryQueue.push({
            type: 'quiz',
            id: `retry-${m.question}-${Date.now()}`,
            question: m.question,
            answer: m.answer,
            level: m.level,
            options: generateQuizOptions(m.answer, options) // Pre-calculate
          });
        });

        set({
          inRetryPhase: true,
          queue: retryQueue,
          currentIndex: 0,
          sessionMistakes: [] // Clear for next pass
        });
      } else {
        // Game Over
        set({ status: 'completed' });
      }
    }
  }
}));
