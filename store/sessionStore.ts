import { create } from 'zustand';
import { Course, PinyinItem, SessionRecord, ViewState } from '../types';
import { getMistakes } from '../services/storage';
import * as CommonData from '../data/pinyin-common';

// --- Helper Functions (Extracted from App.tsx) ---

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const selectSessionItems = (allItems: PinyinItem[], count: number = 20): PinyinItem[] => {
  if (allItems.length === 0) return [];
  
  let pool = [...allItems];
  
  // If not enough items, repeat them until we have enough
  while (pool.length < count) {
    pool = [...pool, ...allItems];
  }

  // Shuffle and slice
  return shuffleArray(pool).slice(0, count);
};

const getCommonDataByLevel = (level: number): PinyinItem[] => {
  const key = `level${level}` as keyof typeof CommonData;
  return CommonData[key] || CommonData.level1;
};

// --- Store Definition ---

interface SessionState {
  // State
  view: ViewState;
  activeItems: PinyinItem[];
  activeCourseTitle: string;
  isMistakeMode: boolean;
  lastSessionRecord: SessionRecord | null;

  // Actions
  setView: (view: ViewState) => void;
  startCourse: (course: Course) => void;
  startMistakeSession: () => void;
  completeSession: (record: SessionRecord) => void;
  exitGame: () => void;
  showHistory: () => void;
  selectHistoryRecord: (record: SessionRecord) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  // Initial State
  view: 'menu',
  activeItems: [],
  activeCourseTitle: "",
  isMistakeMode: false,
  lastSessionRecord: null,

  // Actions
  setView: (view) => set({ view }),

  startCourse: (course: Course) => {
    // Pick random 20 items for this session
    const sessionItems = selectSessionItems(course.data, 20);
    
    if (sessionItems.length > 0) {
      set({
        activeItems: sessionItems,
        activeCourseTitle: course.title,
        isMistakeMode: false,
        view: 'game'
      });
    }
  },

  startMistakeSession: () => {
    const mistakes = getMistakes();
    if (mistakes.length === 0) return;

    let sessionItems: PinyinItem[] = [];
    const MAX_MISTAKE_ITEMS = 10;
    const MIN_THRESHOLD = 5;

    if (mistakes.length >= MAX_MISTAKE_ITEMS) {
      // Case 1: More than 10 mistakes -> Randomly pick 10
      sessionItems = selectSessionItems(mistakes, MAX_MISTAKE_ITEMS);
    } else if (mistakes.length >= MIN_THRESHOLD) {
      // Case 2: Between 5 and 10 -> Use all of them
      sessionItems = shuffleArray(mistakes);
    } else {
      // Case 3: Less than 5 -> Supplement from common data
      sessionItems = [...mistakes];
      const needed = MAX_MISTAKE_ITEMS - sessionItems.length;
      
      // Calculate level distribution of existing mistakes to weight the random selection
      const levels = mistakes.map(m => m.level);
      
      // If for some reason levels is empty (shouldn't be), default to level 1
      const poolLevels = levels.length > 0 ? levels : [1];

      // Fill the rest
      for (let i = 0; i < needed; i++) {
        // 1. Pick a random level based on the distribution of mistakes
        const targetLevel = poolLevels[Math.floor(Math.random() * poolLevels.length)];
        
        // 2. Get items for that level
        const sourceData = getCommonDataByLevel(targetLevel);
        
        // 3. Pick a random item that isn't already in the list
        // Try up to 10 times to find a unique one, otherwise just take one
        let candidate = sourceData[Math.floor(Math.random() * sourceData.length)];
        let attempts = 0;
        while (sessionItems.some(item => item.word === candidate.word) && attempts < 10) {
            candidate = sourceData[Math.floor(Math.random() * sourceData.length)];
            attempts++;
        }
        
        sessionItems.push(candidate);
      }
      
      sessionItems = shuffleArray(sessionItems);
    }

    set({
      activeItems: sessionItems,
      activeCourseTitle: "错题练习",
      isMistakeMode: true,
      view: 'game'
    });
  },

  completeSession: (record: SessionRecord) => {
    set({
      lastSessionRecord: record,
      view: 'report'
    });
  },

  exitGame: () => {
    set({ view: 'menu' });
  },

  showHistory: () => {
    set({ view: 'history' });
  },

  selectHistoryRecord: (record: SessionRecord) => {
    set({
      lastSessionRecord: record,
      view: 'history_report'
    });
  }
}));
