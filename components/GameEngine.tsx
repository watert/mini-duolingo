
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MistakeItem, SessionRecord, QuizChallenge, MatchChallenge, MatchPair } from '../types';
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
  const { activeQueue, activeCourseTitle, isMistakeMode, completeSession } = useSessionStore();
  
  // Redirect if no items (e.g. refresh)
  useEffect(() => {
    if (!activeQueue || activeQueue.length === 0) {
      navigate('/', { replace: true });
    }
  }, [activeQueue, navigate]);

  // Game Engine State & Actions
  const { 
    queue, 
    currentIndex, 
    inRetryPhase, 
    status,
    startTime,
    allMistakes,
    
    initGame,
    resetGame,
    recordMistake,
    advanceRound
  } = useGameStore();

  // Initialize Game
  useEffect(() => {
    if (activeQueue.length > 0) {
      initGame(activeQueue, activeCourseTitle, isMistakeMode);
    }
    return () => {
      resetGame();
    };
  }, [activeQueue, activeCourseTitle, isMistakeMode, initGame, resetGame]);

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
        totalItems: activeQueue.length, 
        mistakes: allMistakes
      };
      
      saveSessionRecord(record);
      completeSession(record);
      // Navigate to report
      navigate('/report', { replace: true });
    }
  }, [status, allMistakes, startTime, activeCourseTitle, activeQueue.length, completeSession, navigate]);

  const handleExit = () => {
    navigate('/');
  };

  // --- Callback Handlers ---

  // For Match View
  const handleMatchSuccess = (pair: MatchPair) => {
    playMatch();
    if (isMistakeMode) {
      removeMistake(pair.question);
    }
  };

  const handleMatchError = (pair: MatchPair) => {
    playError();
    playSelect();
    const mistake: MistakeItem = { ...pair, options: [] }; // Options irrelevant for match error storage
    saveMistake(mistake);
    recordMistake(mistake);
  };

  // For Quiz View
  const handleQuizSuccess = (item: QuizChallenge) => {
    playMatch();
    if (isMistakeMode) {
      removeMistake(item.question);
    }
  };

  const handleQuizError = (item: QuizChallenge) => {
    playError();
    playSelect();
    const mistake: MistakeItem = { 
        question: item.question,
        answer: item.answer,
        level: item.level,
        options: item.options
    };
    saveMistake(mistake);
    recordMistake(mistake);
  };

  const handleStepComplete = () => {
    advanceRound();
  };

  // Calculate Progress
  const totalItems = queue.length;
  let progress = 0;

  if (inRetryPhase) {
    progress = 100;
  } else if (totalItems > 0) {
    progress = (currentIndex / totalItems) * 100;
  }

  const currentItem = queue[currentIndex];

  if (!currentItem) return null;

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
        {currentItem.type === 'match' ? '配对' : '选择'}
      </div>

      {/* Game Content Router */}
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center overscroll-contain">
        {status === 'playing' && (
           currentItem.type === 'match' ? (
             <MatchView 
               key={currentItem.id}
               item={currentItem}
               onSuccess={handleMatchSuccess}
               onError={handleMatchError}
               onComplete={handleStepComplete}
             />
           ) : (
             <QuizView 
               key={currentItem.id} 
               item={currentItem}
               onSuccess={handleQuizSuccess}
               onError={handleQuizError}
               onNext={handleStepComplete}
             />
           )
        )}
      </div>
    </div>
  );
};
