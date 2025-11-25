
import React from 'react';
import { useGameStore } from '../store/gameStore';

export const QuizView: React.FC = () => {
  const { quizState, submitQuizAnswer } = useGameStore();
  const { currentItem, currentOptions, selectedOption, isCorrect } = quizState;

  if (!currentItem) return null;

  return (
    <div className="w-full max-w-sm flex flex-col items-center animate-fade-in">
      {/* Question Card (Hanzi) */}
      <div className="w-full aspect-[2/1] bg-white border-2 border-b-4 border-gray-200 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
        <span className="text-6xl font-black text-gray-800">{currentItem.word}</span>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 w-full gap-3">
        {currentOptions.map((option, idx) => {
          let btnClass = "bg-white border-gray-200 text-gray-600 active:border-b-2 active:translate-y-[2px]";
          
          if (selectedOption) {
            if (option === currentItem.pinyin) {
              // This is the correct answer
              if (selectedOption === option || (selectedOption !== option && isCorrect === false && selectedOption)) {
                 // Show correct in green if user picked it OR if user picked wrong (reveal answer)
                 btnClass = "bg-green-100 border-green-500 text-green-600 border-b-green-500";
              }
            } else if (option === selectedOption && !isCorrect) {
              // User picked this and it's wrong
              btnClass = "bg-red-100 border-red-500 text-red-600 border-b-red-500 animate-shake";
            } else {
              // Other wrong options
              btnClass = "bg-gray-50 border-gray-100 text-gray-300";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => !selectedOption && submitQuizAnswer(option)}
              disabled={!!selectedOption}
              className={`
                w-full p-4 rounded-xl border-2 border-b-4 text-xl font-bold transition-all
                ${btnClass}
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};
