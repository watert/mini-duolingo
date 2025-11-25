import React, { useEffect } from 'react';
import { PinyinItem, SessionRecord } from '../types';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { saveSessionRecord } from '../services/storage';
import { useGameStore } from '../store/gameStore';

interface GameEngineProps {
  items: PinyinItem[];
  courseTitle: string;
  isMistakeMode?: boolean;
  onComplete: (record: SessionRecord) => void;
  onExit: () => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({ 
  items, 
  courseTitle, 
  isMistakeMode = false, 
  onComplete, 
  onExit 
}) => {
  // Selectors
  const { 
    currentCards, 
    queue, 
    currentGroupIndex, 
    inRetryPhase, 
    status,
    startTime,
    allMistakes,
    initGame,
    selectCard,
    resetGame
  } = useGameStore();

  // Initialize Game on Mount or Items Change
  useEffect(() => {
    initGame(items, courseTitle, isMistakeMode);
    return () => {
      resetGame();
    };
  }, [items, courseTitle, isMistakeMode]);

  // Handle Game Completion
  useEffect(() => {
    if (status === 'completed') {
      const endTime = Date.now();
      const record: SessionRecord = {
        id: `session-${endTime}`,
        courseTitle: courseTitle,
        startTime: startTime,
        endTime: endTime,
        duration: endTime - startTime,
        totalItems: items.length, // approximation based on input
        mistakes: allMistakes
      };
      
      saveSessionRecord(record);
      onComplete(record);
    }
  }, [status, allMistakes, startTime, courseTitle, items.length, onComplete]);

  // Calculate Progress
  const totalSteps = queue.length;
  // If in retry phase, show 100%, otherwise calculate normally
  const progress = inRetryPhase 
    ? 100 
    : totalSteps > 0 ? (currentGroupIndex / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pt-4 shrink-0">
         <button 
           onClick={onExit} 
           className="text-gray-400 active:text-gray-600 font-bold text-xl p-2"
           aria-label="Exit Game"
         >
           ✕
         </button>
         <div className="flex-1">
           <ProgressBar progress={progress} />
         </div>
      </div>
      
      {/* Retry Indicator */}
      {inRetryPhase && (
        <div className="text-center text-orange-500 font-bold text-sm animate-pulse shrink-0">
          Reviewing mistakes...
        </div>
      )}

      {/* Game Grid */}
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center overscroll-contain">
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {currentCards.map(card => (
            <Card 
              key={card.id} 
              card={card} 
              onClick={() => selectCard(card.id)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};