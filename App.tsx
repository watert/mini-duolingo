import React from 'react';
import { CourseSelection } from './components/CourseSelection';
import { GameEngine } from './components/GameEngine';
import { HistoryList } from './components/HistoryList';
import { SessionReport } from './components/SessionReport';
import { useSessionStore } from './store/sessionStore';

export default function App() {
  const { 
    view, 
    activeItems, 
    activeCourseTitle, 
    isMistakeMode, 
    lastSessionRecord,
    startCourse,
    startMistakeSession,
    completeSession,
    exitGame,
    showHistory,
    selectHistoryRecord,
    setView
  } = useSessionStore();

  return (
    // changed min-h-screen to h-[100dvh] to fix mobile browser scroll issues
    <div className="h-[100dvh] w-full bg-gray-100 font-sans text-gray-900 flex justify-center overflow-hidden">
      {/* Mobile container simulation */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl relative flex flex-col overflow-hidden">
        
        {view === 'menu' && (
          <CourseSelection 
            onSelect={startCourse} 
            onMistakeSelect={startMistakeSession}
            onHistorySelect={showHistory}
          />
        )}

        {view === 'history' && (
          <HistoryList 
            onBack={() => setView('menu')}
            onSelectRecord={selectHistoryRecord}
          />
        )}

        {view === 'game' && (
          <GameEngine 
            items={activeItems} 
            courseTitle={activeCourseTitle}
            isMistakeMode={isMistakeMode}
            onComplete={completeSession} 
            onExit={exitGame}
          />
        )}

        {view === 'report' && lastSessionRecord && (
          <SessionReport 
            record={lastSessionRecord}
            onClose={() => setView('menu')}
          />
        )}

        {view === 'history_report' && lastSessionRecord && (
          <SessionReport 
            record={lastSessionRecord}
            onClose={() => setView('history')}
          />
        )}

      </div>
      
      {/* Helper styles for shake animation since we don't use external CSS */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-5deg); }
          40% { transform: translateX(8px) rotate(5deg); }
          60% { transform: translateX(-4px) rotate(-2deg); }
          80% { transform: translateX(4px) rotate(2deg); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
