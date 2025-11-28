
export interface BasePinyinItem {
  word: string;
  pinyin: string;
  level: number;
}

// Default items that can be either Quiz or Match (determined by engine)
export interface PinyinDefaultItem extends BasePinyinItem {
  options: string[]; 
  type?: undefined;  
}

// Explicit Quiz Items
export interface PinyinSelectItem extends BasePinyinItem {
  type: 'QUIZ';
  options: string[];
}

// Explicit Match Items (Groups)
export interface PinyinMatchItem {
  type: 'MATCH';
  items: BasePinyinItem[];
}

export type PinyinItem = PinyinDefaultItem | PinyinSelectItem | PinyinMatchItem;

export interface QuizChallenge {
  type: 'quiz';
  id: string;
  question: string;
  answer: string;
  level: number;
  options: string[]; 
}

export interface MatchPair {
  question: string;
  answer: string;
  level: number;
}

export interface MatchChallenge {
  type: 'match';
  id: string;
  pairs: MatchPair[];
}

export type QuizItem = QuizChallenge | MatchChallenge;

export interface MistakeItem {
  question: string;
  answer: string;
  level: number;
  options: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  data: PinyinItem[];
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
  queue: QuizItem[]; 
  currentIndex: number;
  
  courseTitle: string;
  isMistakeMode: boolean;
  inRetryPhase: boolean;
  status: 'idle' | 'playing' | 'completed';
  startTime: number;

  sessionMistakes: MistakeItem[];
  allMistakes: MistakeItem[];
}

export interface CardState {
  id: string;
  question: string; 
  display: string; 
  type: 'question' | 'answer'; 
  status: 'idle' | 'selected' | 'matched' | 'error';
}

export interface SessionRecord {
  id: string;
  courseTitle: string;
  startTime: number; 
  endTime: number; 
  duration: number; 
  totalItems: number;
  mistakes: MistakeItem[]; 
}

export type ViewState = 'menu' | 'game' | 'report' | 'history' | 'history_report';

export interface MatchViewProps {
  item: MatchChallenge;
  onSuccess: (pair: MatchPair) => void;
  onError: (pair: MatchPair) => void;
  onComplete: () => void;
}

export interface QuizViewProps {
  item: QuizChallenge;
  onSuccess: (item: QuizChallenge) => void;
  onError: (item: QuizChallenge) => void;
  onNext: () => void;
}
