import '@/i18n/config';
import React, { useCallback } from 'react';
import { Slot, useRouter } from 'expo-router';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function KidLayout() {
  const router = useRouter();

  const handleManualInput = useCallback(() => {
    router.replace('/(kid)/homework-camera');
  }, [router]);

  return (
    <LanguageProvider>
      <ErrorBoundary onManualInput={handleManualInput}>
        <Slot />
      </ErrorBoundary>
    </LanguageProvider>
  );
}
