import React from 'react';
import { CardState } from '../types';

interface CardProps {
  card: CardState;
  onClick: (card: CardState) => void;
}

export const Card: React.FC<CardProps> = ({ card, onClick }) => {
  const baseClasses = "relative w-full aspect-[4/3] flex items-center justify-center text-xl font-bold rounded-2xl border-2 border-b-4 cursor-pointer transition-all duration-100 select-none active:border-b-2 active:translate-y-[2px] touch-manipulation";
  
  let statusClasses = "bg-white border-gray-200 text-gray-700 active:bg-gray-50";
  
  if (card.status === 'selected') {
    statusClasses = "bg-sky-100 border-sky-400 text-sky-600 border-b-sky-400";
  } else if (card.status === 'matched') {
    statusClasses = "bg-green-100 border-green-500 text-green-600 border-b-green-500 opacity-0 pointer-events-none scale-90";
  } else if (card.status === 'error') {
    statusClasses = "bg-red-100 border-red-500 text-red-600 border-b-red-500 animate-shake";
  }

  return (
    <button
      onClick={() => card.status !== 'matched' && onClick(card)}
      disabled={card.status === 'matched'}
      className={`${baseClasses} ${statusClasses}`}
    >
      {card.display}
    </button>
  );
};