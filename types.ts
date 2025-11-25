
export interface PinyinItem {
  pinyin: string;
  word: string;
  level: number;
  options?: string[]; // Distractors for multiple choice mode, length 3
}

export interface Course {
  id: string;
  title: string;
  description: string;
  data: PinyinItem[];
}

export interface CourseGroup {
  id: string;
  title: string;
  courses: Course[];
}

export type CourseId = string;

export interface GameState {
  score: number;
  mistakes: number;
  completedPairs: number;
  totalPairs: number;
}

export interface CardState {
  id: string; // unique combo of word+type to identify specific card instance
  word: string;
  display: string; // The text to show (either word or pinyin)
  type: 'hanzi' | 'pinyin';
  status: 'idle' | 'selected' | 'matched' | 'error';
}

export interface SessionRecord {
  id: string;
  courseTitle: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  duration: number; // milliseconds
  totalItems: number;
  mistakes: PinyinItem[]; // List of items missed at least once
}

export type GameMode = 'match' | 'quiz';

export interface QuizState {
  currentItem: PinyinItem | null;
  currentOptions: string[]; // 4 options (1 correct + 3 distractors)
  selectedOption: string | null; // The pinyin string selected by user
  isCorrect: boolean | null; // null = pending, true = correct, false = wrong
}

export type ViewState = 'menu' | 'game' | 'report' | 'history' | 'history_report';
