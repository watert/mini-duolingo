import React, { useState, useEffect } from 'react';
import { GameViewProps } from '../types';
import { generateQuizOptions } from '../store/quizLogic';

export const QuizView: React.FC<GameViewProps> = ({ items, onSuccess, onError, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize first question or reset when items change
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setIsProcessing(false);
    
    if (items.length > 0) {
      setCurrentOptions(generateQuizOptions(items[0]));
    }
  }, [items]);

  const handleOptionSelect = (option: string) => {
    if (isProcessing || selectedOption) return;

    const currentItem = items[currentIndex];
    const correct = option === currentItem.pinyin;

    setSelectedOption(option);
    setIsCorrect(correct);
    setIsProcessing(true);

    if (correct) {
      onSuccess(currentItem);
      
      // Delay before next question
      setTimeout(() => {
        const nextIdx = currentIndex + 1;
        if (nextIdx < items.length) {
          // Next Question
          setCurrentIndex(nextIdx);
          setCurrentOptions(generateQuizOptions(items[nextIdx]));
          setSelectedOption(null);
          setIsCorrect(null);
          setIsProcessing(false);
        } else {
          // Finished
          onComplete();
        }
      }, 1000);
    } else {
      onError(currentItem);
      
      // Allow retry after short delay, but keep processing true briefly to show error
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const currentItem = items[currentIndex];
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
      
      {/* Progress within quiz group */}
      <div className="mt-6 flex space-x-2">
        {items.map((_, i) => (
          <div 
            key={i} 
            className={`h-2 w-2 rounded-full ${i === currentIndex ? 'bg-gray-400' : i < currentIndex ? 'bg-green-400' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
};
