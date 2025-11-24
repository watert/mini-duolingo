import React, { useState, useEffect, useRef } from 'react';
import { PinyinItem, CardState, SessionRecord } from '../types';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { saveMistake, removeMistake, saveSessionRecord } from '../services/storage';

interface GameEngineProps {
  items: PinyinItem[];
  courseTitle: string;
  isMistakeMode?: boolean;
  onComplete: (record: SessionRecord) => void;
  onExit: () => void;
}

const SHAKE_ANIMATION_MS = 800;
const MATCH_DELAY_MS = 500;

export const GameEngine: React.FC<GameEngineProps> = ({ items, courseTitle, isMistakeMode = false, onComplete, onExit }) => {
  const [queue, setQueue] = useState<PinyinItem[][]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentCards, setCurrentCards] = useState<CardState[]>([]);
  
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Track mistakes made in this session to retry immediately
  const [sessionMistakes, setSessionMistakes] = useState<PinyinItem[]>([]);
  const [inRetryPhase, setInRetryPhase] = useState(false);

  // Stats for report
  const startTimeRef = useRef<number>(Date.now());
  const allMistakesRef = useRef<PinyinItem[]>([]); // Track all mistakes for the final report

  // Initialize Queue
  useEffect(() => {
    startTimeRef.current = Date.now();
    allMistakesRef.current = [];
    
    // Shuffle all items first
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    const chunks: PinyinItem[][] = [];
    for (let i = 0; i < shuffledItems.length; i += 4) {
      chunks.push(shuffledItems.slice(i, i + 4));
    }
    setQueue(chunks);
    setCurrentGroupIndex(0);
    setSessionMistakes([]);
    setInRetryPhase(false);
  }, [items]);

  // Load cards for current group
  useEffect(() => {
    if (queue.length === 0) return;

    if (currentGroupIndex >= queue.length) {
      // Check for immediate retries
      if (sessionMistakes.length > 0) {
        setInRetryPhase(true);
        // Create a new queue from mistakes
        const mistakeChunks: PinyinItem[][] = [];
        const uniqueMistakes = Array.from(new Set(sessionMistakes)); // Deduplicate
        for (let i = 0; i < uniqueMistakes.length; i += 4) {
          mistakeChunks.push(uniqueMistakes.slice(i, i + 4));
        }
        setQueue(mistakeChunks);
        setCurrentGroupIndex(0);
        setSessionMistakes([]); // Clear session mistakes so we don't loop forever unless failed again
      } else {
        // Complete
        const endTime = Date.now();
        const record: SessionRecord = {
          id: `session-${endTime}`,
          courseTitle: courseTitle,
          startTime: startTimeRef.current,
          endTime: endTime,
          duration: endTime - startTimeRef.current,
          totalItems: items.length,
          mistakes: allMistakesRef.current
        };
        
        saveSessionRecord(record);
        onComplete(record);
      }
      return;
    }

    const group = queue[currentGroupIndex];
    
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

    // Shuffle each type independently
    const shuffledWords = [...wordCards].sort(() => Math.random() - 0.5);
    const shuffledPinyins = [...pinyinCards].sort(() => Math.random() - 0.5);

    // Randomize which side gets Words vs Pinyin for this group
    const wordsOnLeft = Math.random() > 0.5;
    
    const leftCol = wordsOnLeft ? shuffledWords : shuffledPinyins;
    const rightCol = wordsOnLeft ? shuffledPinyins : shuffledWords;

    // Interleave
    const combinedCards: CardState[] = [];
    for (let i = 0; i < 4; i++) {
      if (leftCol[i]) combinedCards.push(leftCol[i]);
      if (rightCol[i]) combinedCards.push(rightCol[i]);
    }

    setCurrentCards(combinedCards);
  }, [queue, currentGroupIndex, onComplete, sessionMistakes, items, courseTitle]);

  const handleCardClick = (clickedCard: CardState) => {
    if (isProcessing || clickedCard.status === 'matched' || clickedCard.status === 'selected') return;

    // 1. First selection
    if (!selectedCardId) {
      setSelectedCardId(clickedCard.id);
      setCurrentCards(prev => prev.map(c => c.id === clickedCard.id ? { ...c, status: 'selected' } : c));
      return;
    }

    // 2. Second selection
    const firstCard = currentCards.find(c => c.id === selectedCardId);
    if (!firstCard) return;
    
    setIsProcessing(true);

    // Update UI to show second selection
    setCurrentCards(prev => prev.map(c => c.id === clickedCard.id ? { ...c, status: 'selected' } : c));

    const isMatch = firstCard.word === clickedCard.word;

    if (isMatch) {
      // SUCCESS
      if (isMistakeMode) {
        removeMistake(firstCard.word);
      }
      
      setTimeout(() => {
        setCurrentCards(prev => prev.map(c => 
          (c.id === firstCard.id || c.id === clickedCard.id) 
            ? { ...c, status: 'matched' } 
            : c
        ));
        setSelectedCardId(null);
        setIsProcessing(false);
      }, 200);
    } else {
      // FAILURE
      const itemToRecord = items.find(i => i.word === firstCard.word || i.word === clickedCard.word);
      if (itemToRecord) {
        saveMistake(itemToRecord); // Save to permanent storage
        
        // Add to session retry queue
        setSessionMistakes(prev => {
            const exists = prev.some(p => p.word === itemToRecord.word);
            return exists ? prev : [...prev, itemToRecord];
        });

        // Add to report stats (track unique per session roughly, or all errors? 
        // Let's track all unique errors for the report)
        const alreadyInReport = allMistakesRef.current.some(m => m.word === itemToRecord.word);
        if (!alreadyInReport) {
            allMistakesRef.current.push(itemToRecord);
        }
      }

      setTimeout(() => {
        setCurrentCards(prev => prev.map(c => 
          (c.id === firstCard.id || c.id === clickedCard.id) 
            ? { ...c, status: 'error' } 
            : c
        ));
        
        setTimeout(() => {
          setCurrentCards(prev => prev.map(c => 
            (c.id === firstCard.id || c.id === clickedCard.id) 
              ? { ...c, status: 'idle' } 
              : c
          ));
          setSelectedCardId(null);
          setIsProcessing(false);
        }, SHAKE_ANIMATION_MS);
      }, 200);
    }
  };

  // Check if group is complete
  useEffect(() => {
    const remaining = currentCards.filter(c => c.status !== 'matched');
    if (currentCards.length > 0 && remaining.length === 0) {
      const timer = setTimeout(() => {
        setCurrentGroupIndex(prev => prev + 1);
      }, MATCH_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [currentCards]);

  const totalSteps = queue.length; 
  const progress = totalSteps > 0 ? (currentGroupIndex / totalSteps) * 100 : 0;
  
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 pt-4">
         <button onClick={onExit} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
           ✕
         </button>
         <div className="flex-1">
           <ProgressBar progress={inRetryPhase ? 100 : progress} />
         </div>
      </div>
      
      {inRetryPhase && (
        <div className="text-center text-orange-500 font-bold text-sm animate-pulse">
          Reviewing mistakes...
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {currentCards.map(card => (
            <Card 
              key={card.id} 
              card={card} 
              onClick={handleCardClick} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};