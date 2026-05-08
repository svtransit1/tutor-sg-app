declare module '@tutor-sg/llm' {
  export interface InferenceRequest {
    ocr: {
      pages: Array<{ blocks: Array<{ text: string; confidence: number }>; text: string }>;
      fullText: string;
      needsManualInput: boolean;
    };
    subject: string;
    grade: string;
    deviceTier: string;
    language: string;
  }

  export interface InferenceResult {
    sessionId: string;
    subject: string;
    questions: Array<{ id: string; text: string }>;
    error?: string;
  }

  export class MockInferenceBridge {
    infer(request: InferenceRequest): Promise<InferenceResult>;
  }
}

declare module '@/services/ocr' {
  export interface OcrBlock {
    text: string;
    confidence: number;
    manuallyEntered?: boolean;
  }

  export interface OcrPage {
    blocks: OcrBlock[];
    text: string;
  }

  export interface OcrResult {
    pages: OcrPage[];
    fullText: string;
    needsManualInput: boolean;
  }

  export class MockOcrService {
    recognizeImages(uris: string[]): Promise<OcrResult>;
  }

  export type OcrService = MockOcrService;
}

declare module '@/storage/onboarding-state' {
  export type Grade = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
  export function loadGrade(): Grade | null;
}

declare module '@/storage/sessions' {
  export function insertFullSession(params: {
    sessionId: string;
    subject: string;
    grade: string;
    questionCount: number;
    inferenceResult: string;
  }): Promise<void>;
}

declare module '@/components/ErrorScreen' {
  import type { ViewStyle } from 'react-native';

  interface ErrorScreenProps {
    variant: string;
    onAction?: () => void;
    onSecondaryAction?: () => void;
    style?: ViewStyle;
  }

  const ErrorScreen: React.FC<ErrorScreenProps>;
  export default ErrorScreen;
}
