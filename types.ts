
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
  // Session Progression
  queue: PinyinItem[][]; 
  currentGroupIndex: number;
  
  // Meta
  courseTitle: string;
  isMistakeMode: boolean;
  inRetryPhase: boolean;
  status: 'idle' | 'playing' | 'completed';
  mode: GameMode;
  startTime: number;

  // Scoring/Tracking
  sessionMistakes: PinyinItem[];
  allMistakes: PinyinItem[];
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

export type ViewState = 'menu' | 'game' | 'report' | 'history' | 'history_report';

// Props for the pure/smart components
export interface GameViewProps {
  items: PinyinItem[];
  onSuccess: (item: PinyinItem) => void;
  onError: (item: PinyinItem) => void;
  onComplete: () => void;
}
