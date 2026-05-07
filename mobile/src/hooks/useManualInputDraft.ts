import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = '@tutor-sg/manual-input-draft';

export interface ManualInputItemDraft {
  itemIndex: number;
  typedText: string;
}

export interface ManualInputDraftData {
  sessionId: string;
  photoUri: string;
  imageWidth: number;
  imageHeight: number;
  subject: string;
  items: ManualInputItemDraft[];
}

export function useManualInputDraft() {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const saveDraft = useCallback((draft: ManualInputDraftData) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        /* silent — non-critical */
      }
    }, 500);
  }, []);

  const clearDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
    } catch {
      /* silent */
    }
  }, []);

  const loadDraft = useCallback(async (): Promise<ManualInputDraftData | null> => {
    try {
      const raw = await AsyncStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ManualInputDraftData;
    } catch {
      return null;
    }
  }, []);

  return { saveDraft, clearDraft, loadDraft } as const;
}
