
/**
 * Prepares options for a quiz question.
 * Ensures the correct answer is included and mixed with distractors.
 * @param answer The correct answer string
 * @param distractors Array of wrong answer strings (options from data)
 * @returns Shuffled array of options including the answer
 */
export const generateQuizOptions = (answer: string, distractors: string[] = []): string[] => {
  // Combine correct answer with distractors
  // We take up to 3 distractors to ensure we have max 4 options
  const pool = [answer, ...distractors.slice(0, 3)];
  
  // Remove duplicates just in case
  const uniquePool = Array.from(new Set(pool));
  
  // Shuffle options
  return uniquePool.sort(() => Math.random() - 0.5);
};
