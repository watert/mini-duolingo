
import { QuizItem, SessionRecord } from '../types';

const MISTAKES_KEY = 'pinyin_mistakes_v1';
const HISTORY_KEY = 'pinyin_history_v1';

// --- Mistakes Logic ---

export const getMistakes = (): QuizItem[] => {
  try {
    const dataStr = localStorage.getItem(MISTAKES_KEY);
    if (!dataStr) return [];
    
    const rawData = JSON.parse(dataStr);
    
    // Migration: Check if data is in old PinyinItem format (word/pinyin) and convert to QuizItem (question/answer)
    // We assume if 'question' is missing but 'word' exists, it's legacy data.
    return rawData.map((item: any) => {
      if (item.word && !item.question) {
        return {
          question: item.word,
          answer: item.pinyin,
          level: item.level,
          options: item.options || []
        } as QuizItem;
      }
      return item as QuizItem;
    });

  } catch (e) {
    console.error("Failed to load mistakes", e);
    return [];
  }
};

export const saveMistake = (item: QuizItem) => {
  const current = getMistakes();
  // Avoid duplicates
  if (!current.some(i => i.question === item.question)) {
    const updated = [...current, item];
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(updated));
  }
};

export const removeMistake = (question: string) => {
  const current = getMistakes();
  const updated = current.filter(i => i.question !== question);
  localStorage.setItem(MISTAKES_KEY, JSON.stringify(updated));
};

export const clearMistakes = () => {
  localStorage.removeItem(MISTAKES_KEY);
};

// --- History Logic ---

export const getHistory = (): SessionRecord[] => {
  try {
    const dataStr = localStorage.getItem(HISTORY_KEY);
    if (!dataStr) return [];
    
    const rawHistory = JSON.parse(dataStr);

    // Perform same migration on nested mistakes within history
    return rawHistory.map((record: any) => {
      if (record.mistakes && record.mistakes.length > 0) {
        // Check first item for legacy format
        if (record.mistakes[0].word && !record.mistakes[0].question) {
          record.mistakes = record.mistakes.map((m: any) => ({
             question: m.word,
             answer: m.pinyin,
             level: m.level,
             options: m.options || []
          }));
        }
      }
      return record as SessionRecord;
    });

  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveSessionRecord = (record: SessionRecord) => {
  try {
    const current = getHistory();
    // Add new record to top, keep only last 100
    const updated = [record, ...current].slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save history", e);
  }
};
