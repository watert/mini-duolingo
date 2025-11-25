
import { QuizItem, CardState } from '../types';

export const generateCardsForGroup = (group: QuizItem[]): CardState[] => {
  // Create Question Cards (formerly Hanzi)
  const questionCards: CardState[] = group.map(item => ({
    id: `q-${item.question}-${item.answer}`,
    question: item.question,
    display: item.question,
    type: 'question',
    status: 'idle'
  }));

  // Create Answer Cards (formerly Pinyin)
  const answerCards: CardState[] = group.map(item => ({
    id: `a-${item.question}-${item.answer}`,
    question: item.question,
    display: item.answer,
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
  for (let i = 0; i < 4; i++) {
    if (leftCol[i]) combinedCards.push(leftCol[i]);
    if (rightCol[i]) combinedCards.push(rightCol[i]);
  }

  return combinedCards;
};
