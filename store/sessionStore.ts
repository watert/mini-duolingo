
import { create } from 'zustand';
import { Course, QuizItem, SessionRecord, PinyinItem } from '../types';
import { getMistakes } from '../services/storage';
import * as CommonData from '../data/pinyin-common';

// Helper to transform specific Pinyin format to generic Quiz format for on-the-fly random generation
const mapPinyinToQuiz = (item: PinyinItem): QuizItem => {
  return {
    question: item.word,
    answer: item.pinyin,
    level: item.level,
    options: item.options || []
  };
};

// --- Helper Functions ---

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const selectSessionItems = (allItems: QuizItem[], count: number = 20): QuizItem[] => {
  if (allItems.length === 0) return [];
  
  let pool = [...allItems];
  
  // If not enough items, repeat them until we have enough
  while (pool.length < count) {
    pool = [...pool, ...allItems];
  }

  // Shuffle and slice
  return shuffleArray(pool).slice(0, count);
};

const getCommonDataByLevel = (level: number): QuizItem[] => {
  const key = `level${level}` as keyof typeof CommonData;
  const rawData: PinyinItem[] = CommonData[key] || CommonData.level1;
  return rawData.map(mapPinyinToQuiz);
};

// --- Store Definition ---

interface SessionState {
  // State
  activeItems: QuizItem[];
  activeCourseTitle: string;
  isMistakeMode: boolean;
  lastSessionRecord: SessionRecord | null;

  // Actions
  startCourse: (course: Course) => void;
  startMistakeSession: () => void;
  completeSession: (record: SessionRecord) => void;
  selectHistoryRecord: (record: SessionRecord) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  // Initial State
  activeItems: [],
  activeCourseTitle: "",
  isMistakeMode: false,
  lastSessionRecord: null,

  // Actions
  startCourse: (course: Course) => {
    // Pick random 20 items for this session
    const sessionItems = selectSessionItems(course.data, 20);
    
    if (sessionItems.length > 0) {
      set({
        activeItems: sessionItems,
        activeCourseTitle: course.title,
        isMistakeMode: false,
      });
    }
  },

  startMistakeSession: () => {
    const mistakes = getMistakes();
    if (mistakes.length === 0) return;

    let sessionItems: QuizItem[] = [];
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
        while (sessionItems.some(item => item.question === candidate.question) && attempts < 10) {
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
    });
  },

  completeSession: (record: SessionRecord) => {
    set({
      lastSessionRecord: record,
    });
  },

  selectHistoryRecord: (record: SessionRecord) => {
    set({
      lastSessionRecord: record,
    });
  }
}));