
import React, { useState, useEffect } from 'react';
import { QuizChallenge, QuizViewProps } from '../types';

export const QuizView: React.FC<QuizViewProps> = ({ 
  item, 
  onSuccess, 
  onError, 
  onNext 
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize state when item changes
  useEffect(() => {
    setSelectedOption(null);
    setIsCorrect(null);
    setIsProcessing(false);
  }, [item]);

  const handleOptionSelect = (option: string) => {
    if (isProcessing || selectedOption) return;

    const correct = option === item.answer;

    setSelectedOption(option);
    setIsCorrect(correct);
    setIsProcessing(true);

    if (correct) {
      onSuccess(item);
      
      // Delay before next question
      setTimeout(() => {
        onNext();
      }, 1000);
    } else {
      onError(item);
      
      // Allow retry after short delay, but keep processing true briefly to show error feedback
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
        setIsProcessing(false);
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center animate-fade-in">
      {/* Question Card */}
      <div className="w-full aspect-[2/1] bg-white border-2 border-b-4 border-gray-200 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
        <span className="text-6xl font-black text-gray-800">{item.question}</span>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 w-full gap-3">
        {item.options.map((option, idx) => {
          let btnClass = "bg-white border-gray-200 text-gray-600 active:border-b-2 active:translate-y-[2px]";
          
          if (selectedOption) {
            if (option === item.answer) {
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
              key={`${item.id}-opt-${idx}`}
              onClick={() => handleOptionSelect(option)}
              disabled={isProcessing || !!selectedOption}
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
