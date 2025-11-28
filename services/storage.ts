
import { MistakeItem, SessionRecord } from '../types';

const MISTAKES_KEY = 'pinyin_mistakes_v2';
const HISTORY_KEY = 'pinyin_history_v2';

// --- Mistakes Logic ---

export const getMistakes = (): MistakeItem[] => {
  try {
    const dataStr = localStorage.getItem(MISTAKES_KEY);
    if (!dataStr) return [];
    
    return JSON.parse(dataStr) as MistakeItem[];
  } catch (e) {
    console.error("Failed to load mistakes", e);
    return [];
  }
};

export const saveMistake = (item: MistakeItem) => {
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
    return JSON.parse(dataStr) as SessionRecord[];
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
