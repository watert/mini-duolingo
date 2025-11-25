import React, { useEffect } from 'react';
import { PinyinItem, SessionRecord } from '../types';
import { ProgressBar } from './ProgressBar';
import { saveSessionRecord, saveMistake, removeMistake } from '../services/storage';
import { playSelect, playMatch, playError, playWin } from '../services/sound';
import { useGameStore } from '../store/gameStore';
import { MatchView } from './MatchView';
import { QuizView } from './QuizView';

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
    // State
    queue, 
    currentGroupIndex, 
    inRetryPhase, 
    status,
    mode,
    startTime,
    allMistakes,
    
    // Actions
    initGame,
    resetGame,
    recordMistake,
    advanceRound
  } = useGameStore();

  // Initialize Game on Mount
  useEffect(() => {
    initGame(items, courseTitle, isMistakeMode);
    return () => {
      resetGame();
    };
  }, [items, courseTitle, isMistakeMode]);

  // Handle Game Completion
  useEffect(() => {
    if (status === 'completed') {
      playWin();
      const endTime = Date.now();
      const record: SessionRecord = {
        id: `session-${endTime}`,
        courseTitle: courseTitle,
        startTime: startTime,
        endTime: endTime,
        duration: endTime - startTime,
        totalItems: items.length, 
        mistakes: allMistakes
      };
      
      saveSessionRecord(record);
      onComplete(record);
    }
  }, [status, allMistakes, startTime, courseTitle, items.length, onComplete]);

  // View Callbacks
  const handleSuccess = (item: PinyinItem) => {
    playMatch();
    // If in mistake mode, remove from persistent storage
    if (isMistakeMode) {
      removeMistake(item.word);
    }
  };

  const handleError = (item: PinyinItem) => {
    playError();
    playSelect(); // Feedback
    saveMistake(item);
    recordMistake(item);
  };

  const handleRoundComplete = () => {
    advanceRound();
  };

  // Calculate Progress
  const totalGroups = queue.length;
  let progress = 0;

  if (inRetryPhase) {
    progress = 100;
  } else if (totalGroups > 0) {
    progress = (currentGroupIndex / totalGroups) * 100;
  }

  // Get current data chunk
  const currentItems = queue[currentGroupIndex] || [];

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

      {/* Mode Indicator */}
      <div className="text-center mt-2 text-xs font-bold text-gray-300 uppercase tracking-widest">
        {mode === 'match' ? '配对' : '选择'}
      </div>

      {/* Game Content Router */}
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center overscroll-contain">
        {status === 'playing' && currentItems.length > 0 && (
           mode === 'match' ? (
             <MatchView 
               items={currentItems}
               onSuccess={handleSuccess}
               onError={handleError}
               onComplete={handleRoundComplete}
             />
           ) : (
             <QuizView 
               items={currentItems}
               onSuccess={handleSuccess}
               onError={handleError}
               onComplete={handleRoundComplete}
             />
           )
        )}
      </div>
    </div>
  );
};
