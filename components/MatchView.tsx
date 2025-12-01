
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './Card';
import { CardState, MatchViewProps } from '../types';
import { generateCardsForGroup } from '../store/matchLogic';

export const MatchView: React.FC<MatchViewProps> = ({ item, onSuccess, onError, onComplete }) => {
  const [cards, setCards] = useState<CardState[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize cards when item changes
  useEffect(() => {
    setCards(generateCardsForGroup(item));
    setSelectedCardId(null);
    setIsProcessing(false);
  }, [item]);

  const handleCardClick = useCallback((clickedId: string) => {
    if (isProcessing) return;

    const clickedCard = cards.find(c => c.id === clickedId);
    
    // Ignore invalid clicks or clicks on already matched items
    if (!clickedCard || clickedCard.status === 'matched') return;

    // 1. Handle Deselection (Clicking the currently selected card)
    if (selectedCardId === clickedId) {
      setSelectedCardId(null);
      setCards(prev => prev.map(c => c.id === clickedId ? { ...c, status: 'idle' } : c));
      return;
    }

    // Ignore clicks on other selected items (though logic below handles single selection flow)
    if (clickedCard.status === 'selected') return;

    // 2. First Selection
    if (!selectedCardId) {
      setSelectedCardId(clickedId);
      setCards(prev => prev.map(c => c.id === clickedId ? { ...c, status: 'selected' } : c));
      return;
    }

    // 3. Second Selection
    const firstCard = cards.find(c => c.id === selectedCardId);
    if (!firstCard) return;

    // Constraint: Prevent selecting item from same column (same type)
    if (firstCard.type === clickedCard.type) {
      return;
    }

    setIsProcessing(true);
    
    // Visually select second card
    setCards(prev => prev.map(c => c.id === clickedId ? { ...c, status: 'selected' } : c));

    // Match based on the question ID
    const isMatch = firstCard.question === clickedCard.question;

    if (isMatch) {
      // Logic Success
      const pair = item.pairs.find(p => p.question === firstCard.question);
      if (pair) onSuccess(pair);

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
          return newCards as CardState[];
        });
        
        setSelectedCardId(null);
        setIsProcessing(false);
      }, 200);

    } else {
      // Logic Error
      const pair = item.pairs.find(p => p.question === firstCard.question || p.question === clickedCard.question);
      if (pair) onError(pair);

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
  }, [cards, selectedCardId, isProcessing, item, onSuccess, onError, onComplete]);

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
