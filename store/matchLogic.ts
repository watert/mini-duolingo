
import { MatchChallenge, CardState } from '../types';

export const generateCardsForGroup = (item: MatchChallenge): CardState[] => {
  const { pairs } = item;
  
  // Create Question Cards
  const questionCards: CardState[] = pairs.map(p => ({
    id: `q-${p.question}-${p.answer}`,
    question: p.question,
    display: p.question,
    type: 'question',
    status: 'idle'
  }));

  // Create Answer Cards
  const answerCards: CardState[] = pairs.map(p => ({
    id: `a-${p.question}-${p.answer}`,
    question: p.question, // Link by question
    display: p.answer,
    type: 'answer',
    status: 'idle'
  }));

  // Shuffle independently
  const shuffledQuestions = [...questionCards].sort(() => Math.random() - 0.5);
  const shuffledAnswers = [...answerCards].sort(() => Math.random() - 0.5);

  // Randomize column layout (Questions on left OR Answers on left)
  const questionsOnLeft = Math.random() > 0.5;
  const leftCol = questionsOnLeft ? shuffledQuestions : shuffledAnswers;
  const rightCol = questionsOnLeft ? shuffledAnswers : shuffledQuestions;

  // Interleave for display grid
  const combinedCards: CardState[] = [];
  const count = pairs.length;
  
  for (let i = 0; i < count; i++) {
    if (leftCol[i]) combinedCards.push(leftCol[i]);
    if (rightCol[i]) combinedCards.push(rightCol[i]);
  }

  return combinedCards;
};
