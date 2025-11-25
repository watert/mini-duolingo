import { create } from 'zustand';
import { PinyinItem, CardState } from '../types';
import { playSelect, playMatch, playError, playWin } from '../services/sound';
import { saveMistake, removeMistake } from '../services/storage';

interface GameState {
  // Game Data
  queue: PinyinItem[][];
  currentGroupIndex: number;
  currentCards: CardState[];
  
  // Interaction State
  selectedCardId: string | null;
  isProcessing: boolean;
  
  // Session Stats
  sessionMistakes: PinyinItem[];
  allMistakes: PinyinItem[];
  startTime: number;
  
  // Meta
  courseTitle: string;
  isMistakeMode: boolean;
  inRetryPhase: boolean;
  status: 'idle' | 'playing' | 'completed';

  // Actions
  initGame: (items: PinyinItem[], courseTitle: string, isMistakeMode: boolean) => void;
  selectCard: (cardId: string) => void;
  resetGame: () => void;
}

// Helper: Generate cards for a group of items
const generateCardsForGroup = (group: PinyinItem[]): CardState[] => {
  // Create Hanzi Cards
  const wordCards: CardState[] = group.map(item => ({
    id: `hanzi-${item.word}-${item.pinyin}`,
    word: item.word,
    display: item.word,
    type: 'hanzi',
    status: 'idle'
  }));

  // Create Pinyin Cards
  const pinyinCards: CardState[] = group.map(item => ({
    id: `pinyin-${item.word}-${item.pinyin}`,
    word: item.word,
    display: item.pinyin,
    type: 'pinyin',
    status: 'idle'
  }));

  // Shuffle independently
  const shuffledWords = [...wordCards].sort(() => Math.random() - 0.5);
  const shuffledPinyins = [...pinyinCards].sort(() => Math.random() - 0.5);

  // Randomize column layout (Words on left OR Pinyin on left)
  const wordsOnLeft = Math.random() > 0.5;
  const leftCol = wordsOnLeft ? shuffledWords : shuffledPinyins;
  const rightCol = wordsOnLeft ? shuffledPinyins : shuffledWords;

  // Interleave for display grid
  const combinedCards: CardState[] = [];
  for (let i = 0; i < 4; i++) {
    if (leftCol[i]) combinedCards.push(leftCol[i]);
    if (rightCol[i]) combinedCards.push(rightCol[i]);
  }

  return combinedCards;
};

export const useGameStore = create<GameState>((set, get) => ({
  queue: [],
  currentGroupIndex: 0,
  currentCards: [],
  selectedCardId: null,
  isProcessing: false,
  sessionMistakes: [],
  allMistakes: [],
  startTime: 0,
  courseTitle: '',
  isMistakeMode: false,
  inRetryPhase: false,
  status: 'idle',

  initGame: (items, courseTitle, isMistakeMode) => {
    // 1. Shuffle Items
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    
    // 2. Create Chunks
    const chunks: PinyinItem[][] = [];
    for (let i = 0; i < shuffledItems.length; i += 4) {
      chunks.push(shuffledItems.slice(i, i + 4));
    }

    // 3. Generate first group cards
    const firstGroupCards = chunks.length > 0 ? generateCardsForGroup(chunks[0]) : [];

    set({
      queue: chunks,
      currentGroupIndex: 0,
      currentCards: firstGroupCards,
      selectedCardId: null,
      isProcessing: false,
      sessionMistakes: [],
      allMistakes: [],
      startTime: Date.now(),
      courseTitle,
      isMistakeMode,
      inRetryPhase: false,
      status: 'playing'
    });
  },

  resetGame: () => {
    set({ status: 'idle', currentCards: [], queue: [] });
  },

  selectCard: (cardId: string) => {
    const state = get();
    
    // Safety checks
    if (state.status !== 'playing' || state.isProcessing) return;
    
    const clickedCard = state.currentCards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.status === 'matched' || clickedCard.status === 'selected') return;

    // --- CASE 1: First Selection ---
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

    // --- CASE 2: Second Selection ---
    const firstCard = state.currentCards.find(c => c.id === state.selectedCardId);
    if (!firstCard) return;

    // Lock interactions
    set({ isProcessing: true });
    
    // Visually select the second card immediately
    set({
      currentCards: state.currentCards.map(c => 
        c.id === cardId ? { ...c, status: 'selected' } : c
      )
    });

    const isMatch = firstCard.word === clickedCard.word;

    if (isMatch) {
      // --- MATCH LOGIC ---
      playMatch();
      
      // Update storage if needed
      if (state.isMistakeMode) {
        removeMistake(firstCard.word);
      }

      // Small delay for visual confirmation before marking matched
      setTimeout(() => {
        const updatedCards = get().currentCards.map(c => 
          (c.id === firstCard.id || c.id === cardId) 
            ? { ...c, status: 'matched' as const } 
            : c
        );

        set({
          currentCards: updatedCards,
          selectedCardId: null,
          isProcessing: false
        });

        // Check if group is complete
        const remaining = updatedCards.filter(c => c.status !== 'matched');
        if (remaining.length === 0) {
          // Group Complete: Move to next group after delay
          setTimeout(() => {
            const currentIdx = get().currentGroupIndex;
            const nextIdx = currentIdx + 1;
            const queue = get().queue;

            if (nextIdx < queue.length) {
              // Next standard group
              set({
                currentGroupIndex: nextIdx,
                currentCards: generateCardsForGroup(queue[nextIdx])
              });
            } else {
              // --- END OF QUEUE LOGIC ---
              const mistakes = get().sessionMistakes;
              
              if (mistakes.length > 0) {
                // Trigger Retry Phase
                const uniqueMistakes = Array.from(new Set(mistakes)); // simple dedup
                const mistakeChunks: PinyinItem[][] = [];
                for (let i = 0; i < uniqueMistakes.length; i += 4) {
                  mistakeChunks.push(uniqueMistakes.slice(i, i + 4));
                }

                set({
                  inRetryPhase: true,
                  queue: mistakeChunks,
                  currentGroupIndex: 0,
                  currentCards: generateCardsForGroup(mistakeChunks[0]),
                  sessionMistakes: [] // clear so we don't loop forever unless failed again
                });
              } else {
                // Game Complete
                playWin();
                set({ status: 'completed' });
              }
            }
          }, 500);
        }
      }, 200);

    } else {
      // --- MISTAKE LOGIC ---
      playError();
      
      // Record mistake
      const itemToRecord = state.queue[state.currentGroupIndex].find(
        i => i.word === firstCard.word || i.word === clickedCard.word
      );

      if (itemToRecord) {
        saveMistake(itemToRecord);
        
        // Add to retry queue if not already there (simple check)
        const currentSessionMistakes = get().sessionMistakes;
        if (!currentSessionMistakes.some(m => m.word === itemToRecord.word)) {
          set({ sessionMistakes: [...currentSessionMistakes, itemToRecord] });
        }

        // Add to all mistakes for report
        const currentAllMistakes = get().allMistakes;
        if (!currentAllMistakes.some(m => m.word === itemToRecord.word)) {
          set({ allMistakes: [...currentAllMistakes, itemToRecord] });
        }
      }

      // Show error state
      setTimeout(() => {
        set({
          currentCards: get().currentCards.map(c => 
            (c.id === firstCard.id || c.id === cardId) 
              ? { ...c, status: 'error' as const } 
              : c
          )
        });

        // Reset to idle
        setTimeout(() => {
          set({
            currentCards: get().currentCards.map(c => 
              (c.id === firstCard.id || c.id === cardId) 
                ? { ...c, status: 'idle' as const } 
                : c
            ),
            selectedCardId: null,
            isProcessing: false
          });
        }, 800); // Wait for shake animation
      }, 200);
    }
  }
}));