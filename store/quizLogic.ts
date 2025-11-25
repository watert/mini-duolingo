
import { QuizItem } from '../types';

/**
 * Prepares options for a quiz question.
 * Ensures the correct answer is included and mixed with distractors.
 */
export const generateQuizOptions = (item: QuizItem): string[] => {
  const distractors = item.options || [];
  
  // Combine correct answer with distractors
  // We take up to 3 distractors to ensure we have max 4 options
  const pool = [item.answer, ...distractors.slice(0, 3)];
  
  // Shuffle options
  return pool.sort(() => Math.random() - 0.5);
};
