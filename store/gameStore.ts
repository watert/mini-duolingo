
import { create } from 'zustand';
import { PinyinItem, CardState, GameMode, QuizState } from '../types';
import { playSelect, playMatch, playError, playWin } from '../services/sound';
import { saveMistake, removeMistake } from '../services/storage';
import { generateCardsForGroup } from './matchLogic';
import { generateQuizOptions } from './quizLogic';

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

  // --- Match Mode State ---
  currentCards: CardState[];
  selectedCardId: string | null;
  
  // --- Quiz Mode State ---
  quizQueue: PinyinItem[]; // The current group being quizzed
  quizIndex: number; // Index within the quizQueue
  quizState: QuizState;

  // --- Common State ---
  isProcessing: boolean;
  sessionMistakes: PinyinItem[];
  allMistakes: PinyinItem[];
  startTime: number;

  // --- Actions ---
  initGame: (items: PinyinItem[], courseTitle: string, isMistakeMode: boolean) => void;
  resetGame: () => void;
  
  // Match Specific
  selectCard: (cardId: string) => void;
  
  // Quiz Specific
  submitQuizAnswer: (option: string) => void;
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
  
  currentCards: [],
  selectedCardId: null,
  
  quizQueue: [],
  quizIndex: 0,
  quizState: {
    currentItem: null,
    currentOptions: [],
    selectedOption: null,
    isCorrect: null,
  },

  isProcessing: false,
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

    // Start the first round
    startRound(chunks[0], set, false); // force match for first round? or random?
  },

  resetGame: () => {
    set({ status: 'idle', currentCards: [], queue: [] });
  },

  // ----------------------------------------------------------------
  // MATCH MODE LOGIC
  // ----------------------------------------------------------------
  selectCard: (cardId: string) => {
    const state = get();
    if (state.mode !== 'match' || state.status !== 'playing' || state.isProcessing) return;
    
    const clickedCard = state.currentCards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.status === 'matched' || clickedCard.status === 'selected') return;

    // 1. First Selection
    if (!state.selectedCardId) {
      playSelect();
      set({
        selectedCardId: cardId,
        currentCards: state.currentCards.map(c => 
          c.id === cardId ? { ...c, status: 'selected' } : c
        )
      });
      return;
    }

    // 2. Second Selection
    const firstCard = state.currentCards.find(c => c.id === state.selectedCardId);
    if (!firstCard) return;

    set({ isProcessing: true });
    
    // Visually select second card
    set({
      currentCards: state.currentCards.map(c => 
        c.id === cardId ? { ...c, status: 'selected' } : c
      )
    });

    const isMatch = firstCard.word === clickedCard.word;

    if (isMatch) {
      handleMatchSuccess(firstCard.word, [firstCard.id, cardId], set, get);
    } else {
      const item = state.queue[state.currentGroupIndex].find(
        i => i.word === firstCard.word || i.word === clickedCard.word
      );
      handleMistake(item, set, get);
      
      // Visual Error Feedback
      setTimeout(() => {
        set({
          currentCards: get().currentCards.map(c => 
            (c.id === firstCard.id || c.id === cardId) ? { ...c, status: 'error' } : c
          )
        });
        setTimeout(() => {
          set({
            currentCards: get().currentCards.map(c => 
              (c.id === firstCard.id || c.id === cardId) ? { ...c, status: 'idle' } : c
            ),
            selectedCardId: null,
            isProcessing: false
          });
        }, 800);
      }, 200);
    }
  },

  // ----------------------------------------------------------------
  // QUIZ MODE LOGIC
  // ----------------------------------------------------------------
  submitQuizAnswer: (option: string) => {
    const state = get();
    if (state.mode !== 'quiz' || state.status !== 'playing' || state.isProcessing) return;
    
    const currentItem = state.quizState.currentItem;
    if (!currentItem) return;

    const isCorrect = option === currentItem.pinyin;

    set({
      quizState: {
        ...state.quizState,
        selectedOption: option,
        isCorrect: isCorrect
      },
      isProcessing: true
    });

    if (isCorrect) {
      playMatch();
      if (state.isMistakeMode) removeMistake(currentItem.word);

      setTimeout(() => {
        const nextIndex = state.quizIndex + 1;
        if (nextIndex < state.quizQueue.length) {
          // Next Question
          setupQuizQuestion(state.quizQueue, nextIndex, set);
        } else {
          // Quiz Group Complete
          handleRoundComplete(set, get);
        }
      }, 1000);
    } else {
      handleMistake(currentItem, set, get);
      playError();
      // Allow retry after short delay? Or just move on? 
      // Design choice: Stay on card until correct, but already recorded mistake.
      // Let's reset interaction to allow retry.
      setTimeout(() => {
        set({
          isProcessing: false,
          quizState: {
             ...get().quizState,
             selectedOption: null, // Reset selection to allow try again
             isCorrect: null
          }
        });
      }, 1000);
    }
  }
}));

// --- Internal Helper Functions to switch rounds and modes ---

const startRound = (group: PinyinItem[], set: any, isRetry: boolean) => {
  // Decide Mode: 
  // If items have no options, must be Match.
  // Ratio Request: 1 Quiz : 4 Match (approx 20% chance for Quiz)
  
  const canQuiz = group.every(item => item.options && item.options.length >= 3);
  
  // Lower probability to ~0.2 (20%) for Quiz mode
  const mode: GameMode = canQuiz && Math.random() < 0.2 ? 'quiz' : 'match';

  if (mode === 'match') {
    set({
      mode: 'match',
      currentCards: generateCardsForGroup(group),
      selectedCardId: null,
      isProcessing: false
    });
  } else {
    set({
      mode: 'quiz',
      quizQueue: group,
      quizIndex: 0,
      isProcessing: false
    });
    setupQuizQuestion(group, 0, set);
  }
};

const setupQuizQuestion = (queue: PinyinItem[], index: number, set: any) => {
  const item = queue[index];
  set({
    quizIndex: index,
    quizState: {
      currentItem: item,
      currentOptions: generateQuizOptions(item),
      selectedOption: null,
      isCorrect: null
    },
    isProcessing: false
  });
};

const handleMatchSuccess = (word: string, cardIds: string[], set: any, get: any) => {
  playMatch();
  if (get().isMistakeMode) removeMistake(word);

  setTimeout(() => {
    // Mark Matched
    const updatedCards = get().currentCards.map((c: CardState) => 
      cardIds.includes(c.id) ? { ...c, status: 'matched' } : c
    );

    set({
      currentCards: updatedCards,
      selectedCardId: null,
      isProcessing: false
    });

    // Check if round done
    const remaining = updatedCards.filter((c: CardState) => c.status !== 'matched');
    if (remaining.length === 0) {
      handleRoundComplete(set, get);
    }
  }, 200);
};

const handleRoundComplete = (set: any, get: any) => {
  setTimeout(() => {
    const { currentGroupIndex, queue, inRetryPhase, sessionMistakes } = get();
    
    // Check if we have more groups in current queue
    const nextIdx = currentGroupIndex + 1;
    
    if (nextIdx < queue.length) {
      set({ currentGroupIndex: nextIdx });
      startRound(queue[nextIdx], set, inRetryPhase);
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
        startRound(mistakeChunks[0], set, true);
      } else {
        // Game Over
        playWin();
        set({ status: 'completed' });
      }
    }
  }, 500);
};

const handleMistake = (item: PinyinItem | undefined, set: any, get: any) => {
  if (!item) return;
  
  saveMistake(item);
  
  const { sessionMistakes, allMistakes } = get();
  if (!sessionMistakes.some((m: PinyinItem) => m.word === item.word)) {
    set({ sessionMistakes: [...sessionMistakes, item] });
  }
  if (!allMistakes.some((m: PinyinItem) => m.word === item.word)) {
    set({ allMistakes: [...allMistakes, item] });
  }
};
