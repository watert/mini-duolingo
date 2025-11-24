import React, { useState } from 'react';
import { CourseSelection } from './components/CourseSelection';
import { GameEngine } from './components/GameEngine';
import { HistoryList } from './components/HistoryList';
import { SessionReport } from './components/SessionReport';
import { Course, PinyinItem, SessionRecord } from './types';
import { getMistakes } from './services/storage';

type ViewState = 'menu' | 'game' | 'report' | 'history' | 'history_report';

// Helper to pick random 20 items
const selectSessionItems = (allItems: PinyinItem[], count: number = 20): PinyinItem[] => {
  if (allItems.length === 0) return [];
  
  let pool = [...allItems];
  
  // If not enough items, repeat them until we have enough
  while (pool.length < count) {
    pool = [...pool, ...allItems];
  }

  // Shuffle
  pool.sort(() => Math.random() - 0.5);

  // Return exact count
  return pool.slice(0, count);
};

export default function App() {
  const [view, setView] = useState<ViewState>('menu');
  const [activeItems, setActiveItems] = useState<PinyinItem[]>([]);
  const [activeCourseTitle, setActiveCourseTitle] = useState("");
  const [isMistakeMode, setIsMistakeMode] = useState(false);
  const [lastSessionRecord, setLastSessionRecord] = useState<SessionRecord | null>(null);

  const handleStartCourse = (course: Course) => {
    // Pick random 20 items for this session
    const sessionItems = selectSessionItems(course.data, 20);
    
    if (sessionItems.length > 0) {
      setActiveItems(sessionItems);
      setActiveCourseTitle(course.title);
      setIsMistakeMode(false);
      setView('game');
    }
  };

  const handleStartMistakes = () => {
    const mistakes = getMistakes();
    if (mistakes.length > 0) {
      const sessionItems = selectSessionItems(mistakes, 20);
      setActiveItems(sessionItems);
      setActiveCourseTitle("错题练习");
      setIsMistakeMode(true);
      setView('game');
    }
  }

  const handleGameComplete = (record: SessionRecord) => {
    setLastSessionRecord(record);
    setView('report');
  };

  const handleExit = () => {
    setView('menu');
  };

  const handleShowHistory = () => {
    setView('history');
  };

  const handleSelectHistoryRecord = (record: SessionRecord) => {
    setLastSessionRecord(record);
    setView('history_report');
  };

  return (
    // changed min-h-screen to h-[100dvh] to fix mobile browser scroll issues
    <div className="h-[100dvh] w-full bg-gray-100 font-sans text-gray-900 flex justify-center overflow-hidden">
      {/* Mobile container simulation */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl relative flex flex-col overflow-hidden">
        
        {view === 'menu' && (
          <CourseSelection 
            onSelect={handleStartCourse} 
            onMistakeSelect={handleStartMistakes}
            onHistorySelect={handleShowHistory}
          />
        )}

        {view === 'history' && (
          <HistoryList 
            onBack={() => setView('menu')}
            onSelectRecord={handleSelectHistoryRecord}
          />
        )}

        {view === 'game' && (
          <GameEngine 
            items={activeItems} 
            courseTitle={activeCourseTitle}
            isMistakeMode={isMistakeMode}
            onComplete={handleGameComplete} 
            onExit={handleExit}
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