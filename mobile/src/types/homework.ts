export interface OcrBlock {
  id: string;
  text: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export interface OcrResult {
  blocks: OcrBlock[];
  lowConfidenceBlocks: OcrBlock[];
  imageUris: string[];
  pageCount: number;
  timestamp: number;
}

export type FeedbackType = 'hint' | 'step' | 'solution' | 'error';

export interface FeedbackBlock {
  id: string;
  type: FeedbackType;
  title: string;
  content: string;
}

export interface HomeworkSession {
  id: string;
  ocrResult: OcrResult | null;
  subject: string;
  level: string;
  feedbackBlocks: FeedbackBlock[];
  rawLlmResponse: string;
  startedAt: number;
  completedAt: number | null;
  status: 'capturing' | 'processing' | 'feedback' | 'error';
}

export type Subject = 'math' | 'english' | 'science' | 'chinese_mt';

export interface SubjectInfo {
  key: Subject;
  icon: string;
  labelEn: string;
  labelZh: string;
}

export const SUBJECTS: SubjectInfo[] = [
  { key: 'math', icon: '📐', labelEn: 'Mathematics', labelZh: '数学' },
  { key: 'english', icon: '📖', labelEn: 'English', labelZh: '英语' },
  { key: 'science', icon: '🔬', labelEn: 'Science', labelZh: '科学' },
  { key: 'chinese_mt', icon: '✍️', labelEn: 'Chinese MT', labelZh: '华文' },
];
