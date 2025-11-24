import { PinyinItem, SessionRecord } from '../types';

const MISTAKES_KEY = 'pinyin_mistakes_v1';
const HISTORY_KEY = 'pinyin_history_v1';

// --- Mistakes Logic ---

export const getMistakes = (): PinyinItem[] => {
  try {
    const data = localStorage.getItem(MISTAKES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load mistakes", e);
    return [];
  }
};

export const saveMistake = (item: PinyinItem) => {
  const current = getMistakes();
  // Avoid duplicates
  if (!current.some(i => i.word === item.word)) {
    const updated = [...current, item];
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(updated));
  }
};

export const removeMistake = (word: string) => {
  const current = getMistakes();
  const updated = current.filter(i => i.word !== word);
  localStorage.setItem(MISTAKES_KEY, JSON.stringify(updated));
};

export const clearMistakes = () => {
  localStorage.removeItem(MISTAKES_KEY);
};

// --- History Logic ---

export const getHistory = (): SessionRecord[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
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