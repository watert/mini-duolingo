
import React from 'react';
import { Card } from './Card';
import { useGameStore } from '../store/gameStore';

export const MatchView: React.FC = () => {
  const { currentCards, selectCard } = useGameStore();

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-sm animate-fade-in">
      {currentCards.map(card => (
        <Card 
          key={card.id} 
          card={card} 
          onClick={() => selectCard(card.id)} 
        />
      ))}
    </div>
  );
};
