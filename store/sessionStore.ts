
import { create } from 'zustand';
import { Course, QuizItem, SessionRecord, PinyinItem, PinyinDefaultItem, MistakeItem, PinyinMatchItem } from '../types';
import { getMistakes } from '../services/storage';
import { generateQuizOptions } from './quizLogic';
import * as CommonData from '../data/pinyin-common';

// --- Helper Functions ---

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const getCommonDataByLevel = (level: number): PinyinItem[] => {
  const key = `level${level}` as keyof typeof CommonData;
  return CommonData[key] || CommonData.level1;
};

// --- Game Generation Logic ---

const generateGameQueue = (items: PinyinItem[]): QuizItem[] => {
  const queue: QuizItem[] = [];
  const defaultItems: PinyinDefaultItem[] = [];

  // 1. Process items
  items.forEach(item => {
    // Check types explicitly
    if (item.type === 'QUIZ') {
      // PinyinSelectItem (Explicit Quiz)
      queue.push({
        type: 'quiz',
        id: `quiz-${Math.random().toString(36).substr(2, 9)}`,
        question: item.word,
        answer: item.pinyin,
        level: item.level,
        // For explicit quiz, items options are usually distractors or full set.
        // generateQuizOptions handles mixing answer with distractors.
        options: generateQuizOptions(item.pinyin, item.options) 
      });
    } else if (item.type === 'MATCH') {
      // PinyinMatchItem (Explicit Match Group)
      // Need to cast because TypeScript narrowing on discriminating unions inside loops can be tricky without a direct switch
      const matchItem = item as PinyinMatchItem;
      queue.push({
        type: 'match',
        id: `match-${Math.random().toString(36).substr(2, 9)}`,
        pairs: matchItem.items.map(sub => ({
          question: sub.word,
          answer: sub.pinyin,
          level: sub.level
        }))
      });
    } else {
      // PinyinDefaultItem (implicit type, fallback to dynamic grouping)
      defaultItems.push(item as PinyinDefaultItem);
    }
  });

  // 2. Process default items (Grouping into chunks of 4)
  const chunks: PinyinDefaultItem[][] = [];
  for (let i = 0; i < defaultItems.length; i += 4) {
    chunks.push(defaultItems.slice(i, i + 4));
  }

  chunks.forEach(chunk => {
    // Determine mode for this chunk
    // Requirement for Quiz: Must have options
    const canQuiz = chunk.every(i => i.options && i.options.length >= 3);
    const isQuizMode = canQuiz && Math.random() < 0.2; // 20% chance for quiz mode if possible

    if (isQuizMode) {
      // Add 4 individual quiz items
      chunk.forEach(item => {
        queue.push({
          type: 'quiz',
          id: `quiz-${item.word}-${Date.now()}`,
          question: item.word,
          answer: item.pinyin,
          level: item.level,
          options: generateQuizOptions(item.pinyin, item.options) // Pre-calculate
        });
      });
    } else {
      // Add 1 match item containing the chunk
      queue.push({
        type: 'match',
        id: `match-${chunk[0].word}-${Date.now()}`,
        pairs: chunk.map(i => ({
          question: i.word,
          answer: i.pinyin,
          level: i.level
        }))
      });
    }
  });

  return shuffleArray(queue);
};

// Mistake items are usually raw pairs with distractor options
const generateMistakeQueue = (mistakes: MistakeItem[]): QuizItem[] => {
  const queue: QuizItem[] = [];
  const shuffled = shuffleArray(mistakes);
  
  const chunks: MistakeItem[][] = [];
  for (let i = 0; i < shuffled.length; i += 4) {
    chunks.push(shuffled.slice(i, i + 4));
  }

  chunks.forEach(chunk => {
     if (chunk.length < 4) {
       // Too few for a match, do quizzes
       chunk.forEach(m => {
         queue.push({
           type: 'quiz',
           id: `retry-quiz-${m.question}`,
           question: m.question,
           answer: m.answer,
           level: m.level,
           options: generateQuizOptions(m.answer, m.options) // Pre-calculate
         });
       });
     } else {
       // Create a match
       queue.push({
         type: 'match',
         id: `retry-match-${chunk[0].question}`,
         pairs: chunk.map(m => ({
           question: m.question,
           answer: m.answer,
           level: m.level
         }))
       });
     }
  });

  return queue;
};

// --- Store Definition ---

interface SessionState {
  // State
  activeQueue: QuizItem[]; // Prepared queue
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
  activeQueue: [],
  activeCourseTitle: "",
  isMistakeMode: false,
  lastSessionRecord: null,

  // Actions
  startCourse: (course: Course) => {
    // 1. Select raw items
    let sessionItems: PinyinItem[] = [];
    
    // For specialized courses, we typically want the whole set if it's small
    if (course.data.length <= 40) {
      sessionItems = course.data; 
    } else {
       let pool = [...course.data];
       sessionItems = shuffleArray(pool).slice(0, 20);
    }
    
    // 2. Generate Game Queue
    const queue = generateGameQueue(sessionItems);

    if (queue.length > 0) {
      set({
        activeQueue: queue,
        activeCourseTitle: course.title,
        isMistakeMode: false,
      });
    }
  },

  startMistakeSession: () => {
    const mistakes = getMistakes();
    if (mistakes.length === 0) return;

    // Pick mistakes logic
    let selectedMistakes: MistakeItem[] = [];
    const MAX = 10;
    
    if (mistakes.length >= MAX) {
      selectedMistakes = shuffleArray(mistakes).slice(0, MAX);
    } else {
       // Supplement
       selectedMistakes = [...mistakes];
       const needed = MAX - selectedMistakes.length;
       
       // Supplement with random items
       const supplementSource = getCommonDataByLevel(1) as PinyinDefaultItem[];
       const shuffledSource = shuffleArray(supplementSource);
       
       let added = 0;
       for (const item of shuffledSource) {
         if (added >= needed) break;
         if (!selectedMistakes.some(m => m.question === item.word)) {
            selectedMistakes.push({
              question: item.word,
              answer: item.pinyin,
              level: item.level,
              options: item.options || []
            });
            added++;
         }
       }
    }

    const queue = generateMistakeQueue(selectedMistakes);

    set({
      activeQueue: queue,
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
