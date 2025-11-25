
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizItem, SessionRecord } from '../types';
import { ProgressBar } from './ProgressBar';
import { saveSessionRecord, saveMistake, removeMistake } from '../services/storage';
import { playSelect, playMatch, playError, playWin } from '../services/sound';
import { useGameStore } from '../store/gameStore';
import { useSessionStore } from '../store/sessionStore';
import { MatchView } from './MatchView';
import { QuizView } from './QuizView';

export const GameEngine: React.FC = () => {
  const navigate = useNavigate();
  
  // Session Data from Store
  const { activeItems, activeCourseTitle, isMistakeMode, completeSession } = useSessionStore();

  // Redirect if no items (e.g. refresh)
  useEffect(() => {
    if (!activeItems || activeItems.length === 0) {
      navigate('/', { replace: true });
    }
  }, [activeItems, navigate]);

  // Game Engine State & Actions
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
    recordMistake,
    advanceRound
  } = useGameStore();

  // Initialize Game
  useEffect(() => {
    if (activeItems.length > 0) {
      initGame(activeItems, activeCourseTitle, isMistakeMode);
    }
    return () => {
      resetGame();
    };
  }, [activeItems, activeCourseTitle, isMistakeMode, initGame, resetGame]);

  // Handle Game Completion
  useEffect(() => {
    if (status === 'completed') {
      playWin();
      const endTime = Date.now();
      const record: SessionRecord = {
        id: `session-${endTime}`,
        courseTitle: activeCourseTitle,
        startTime: startTime,
        endTime: endTime,
        duration: endTime - startTime,
        totalItems: activeItems.length, 
        mistakes: allMistakes
      };
      
      saveSessionRecord(record);
      completeSession(record);
      // Navigate to report, replacing the game route so back button goes to menu
      navigate('/report', { replace: true });
    }
  }, [status, allMistakes, startTime, activeCourseTitle, activeItems.length, completeSession, navigate]);

  const handleExit = () => {
    navigate('/');
  };

  // View Callbacks
  const handleSuccess = (item: QuizItem) => {
    playMatch();
    if (isMistakeMode) {
      removeMistake(item.question);
    }
  };

  const handleError = (item: QuizItem) => {
    playError();
    playSelect();
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

  if (!activeItems || activeItems.length === 0) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pt-4 shrink-0">
         <button 
           onClick={handleExit} 
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