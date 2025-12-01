import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CourseSelection } from './components/CourseSelection';
import { GameEngine } from './components/GameEngine';
import { HistoryList } from './components/HistoryList';
import { SessionReport } from './components/SessionReport';

export default function App() {
  return (
    <>
      {/* changed min-h-screen to h-[100dvh] to fix mobile browser scroll issues */}
      <div className="h-[100dvh] w-full bg-gray-100 font-sans text-gray-900 flex justify-center overflow-hidden">
        {/* Mobile container simulation */}
        <div className="w-full max-w-md bg-white h-full shadow-2xl relative flex flex-col overflow-hidden">
          <HashRouter>
            <Routes>
              <Route path="/" element={<CourseSelection />} />
              <Route path="/game" element={<GameEngine />} />
              <Route path="/history" element={<HistoryList />} />
              <Route path="/report" element={<SessionReport />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
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
    </>
  );
}