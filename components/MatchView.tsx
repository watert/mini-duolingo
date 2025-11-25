import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './Card';
import { CardState, GameViewProps } from '../types';
import { generateCardsForGroup } from '../store/matchLogic';

export const MatchView: React.FC<GameViewProps> = ({ items, onSuccess, onError, onComplete }) => {
  const [cards, setCards] = useState<CardState[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize cards when items change (new round)
  useEffect(() => {
    setCards(generateCardsForGroup(items));
    setSelectedCardId(null);
    setIsProcessing(false);
  }, [items]);

  const handleCardClick = useCallback((clickedId: string) => {
    if (isProcessing) return;

    const clickedCard = cards.find(c => c.id === clickedId);
    if (!clickedCard || clickedCard.status === 'matched' || clickedCard.status === 'selected') return;

    // 1. First Selection
    if (!selectedCardId) {
      setSelectedCardId(clickedId);
      setCards(prev => prev.map(c => c.id === clickedId ? { ...c, status: 'selected' } : c));
      return;
    }

    // 2. Second Selection
    const firstCard = cards.find(c => c.id === selectedCardId);
    if (!firstCard) return;

    setIsProcessing(true);
    
    // Visually select second card
    setCards(prev => prev.map(c => c.id === clickedId ? { ...c, status: 'selected' } : c));

    const isMatch = firstCard.word === clickedCard.word;

    if (isMatch) {
      // Logic Success
      const matchedItem = items.find(i => i.word === firstCard.word);
      if (matchedItem) onSuccess(matchedItem);

      setTimeout(() => {
        // Update state to matched
        setCards(prev => {
          const newCards = prev.map(c => 
            (c.id === firstCard.id || c.id === clickedId) ? { ...c, status: 'matched' } : c
          );
          
          // Check for completion
          const remaining = newCards.filter(c => c.status !== 'matched');
          if (remaining.length === 0) {
            onComplete();
          }
          return newCards as CardState[]; // cast to satisfy TS strictness if needed
        });
        
        setSelectedCardId(null);
        setIsProcessing(false);
      }, 200);

    } else {
      // Logic Error
      const mistakeItem = items.find(i => i.word === firstCard.word || i.word === clickedCard.word);
      if (mistakeItem) onError(mistakeItem);

      setTimeout(() => {
        // Show error state
        setCards(prev => prev.map(c => 
          (c.id === firstCard.id || c.id === clickedId) ? { ...c, status: 'error' } : c
        ));
        
        // Reset to idle
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstCard.id || c.id === clickedId) ? { ...c, status: 'idle' } : c
          ));
          setSelectedCardId(null);
          setIsProcessing(false);
        }, 800);
      }, 200);
    }
  }, [cards, selectedCardId, isProcessing, items, onSuccess, onError, onComplete]);

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-sm animate-fade-in">
      {cards.map(card => (
        <Card 
          key={card.id} 
          card={card} 
          onClick={() => handleCardClick(card.id)} 
        />
      ))}
    </div>
  );
};
