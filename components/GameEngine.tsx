
import React, { useEffect } from 'react';
import { PinyinItem, SessionRecord } from '../types';
import { ProgressBar } from './ProgressBar';
import { saveSessionRecord } from '../services/storage';
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
    queue, 
    currentGroupIndex, 
    inRetryPhase, 
    status,
    mode,
    startTime,
    allMistakes,
    initGame,
    resetGame,
    quizIndex,
    quizQueue
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

  // Calculate Progress
  // Total steps is basically number of groups. 
  // We can refine this to be specific items, but group based is fine for the bar.
  const totalGroups = queue.length;
  let progress = 0;

  if (inRetryPhase) {
    progress = 100;
  } else if (totalGroups > 0) {
    // Base progress on groups
    const baseProgress = (currentGroupIndex / totalGroups) * 100;
    
    // Add micro-progress for Quiz mode within a group
    let microProgress = 0;
    if (mode === 'quiz' && quizQueue.length > 0) {
      const groupWeight = 100 / totalGroups;
      microProgress = (quizIndex / quizQueue.length) * groupWeight;
    }
    
    progress = Math.min(100, baseProgress + microProgress);
  }

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

      {/* Mode Indicator (Optional, debug friendly or for user context) */}
      <div className="text-center mt-2 text-xs font-bold text-gray-300 uppercase tracking-widest">
        {mode === 'match' ? '配对' : '选择'}
      </div>

      {/* Game Content Router */}
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center overscroll-contain">
        {status === 'playing' && (
           mode === 'match' ? <MatchView /> : <QuizView />
        )}
      </div>
    </div>
  );
};
