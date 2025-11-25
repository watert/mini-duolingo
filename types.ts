
export interface PinyinItem {
  pinyin: string;
  word: string;
  level: number;
  options?: string[]; // Distractors for multiple choice mode, length 3
}

export interface QuizItem {
  question: string; // Formerly 'word'
  answer: string;   // Formerly 'pinyin'
  level: number;
  options: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  data: QuizItem[];
}

export type CourseCategory = 'pinyin' | 'other';

export interface CourseGroup {
  id: string;
  title: string;
  category: CourseCategory;
  courses: Course[];
}

export type CourseId = string;

export interface GameState {
  // Session Progression
  queue: QuizItem[][]; 
  currentGroupIndex: number;
  
  // Meta
  courseTitle: string;
  isMistakeMode: boolean;
  inRetryPhase: boolean;
  status: 'idle' | 'playing' | 'completed';
  mode: GameMode;
  startTime: number;

  // Scoring/Tracking
  sessionMistakes: QuizItem[];
  allMistakes: QuizItem[];
}

export interface CardState {
  id: string; // unique combo of question+type
  question: string; // Formerly word
  display: string; // The text to show (either question or answer)
  type: 'question' | 'answer'; // Formerly 'hanzi' | 'pinyin'
  status: 'idle' | 'selected' | 'matched' | 'error';
}

export interface SessionRecord {
  id: string;
  courseTitle: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  duration: number; // milliseconds
  totalItems: number;
  mistakes: QuizItem[]; // List of items missed at least once
}

export type GameMode = 'match' | 'quiz';

export type ViewState = 'menu' | 'game' | 'report' | 'history' | 'history_report';

// Props for the pure/smart components
export interface GameViewProps {
  items: QuizItem[];
  onSuccess: (item: QuizItem) => void;
  onError: (item: QuizItem) => void;
  onComplete: () => void;
}
