import React, { useCallback } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import ManualInputScreen from '../../src/screens/manual-input/ManualInputScreen';
import type { Subject } from '../../src/models/homework-feedback';
import type { ManualInputItem } from '../../src/screens/manual-input';

export default function ManualInputRoute() {
  const params = useLocalSearchParams<{
    photoUri: string;
    imageWidth?: string;
    imageHeight?: string;
  }>();

  if (!params.photoUri) return null;

  const imageWidth = params.imageWidth ? parseInt(params.imageWidth, 10) : 1920;
  const imageHeight = params.imageHeight ? parseInt(params.imageHeight, 10) : 1080;

  const mockLowConfBlocks = [
    { text: 'Mary cut off 1/3 m.', boundingBox: { x: 120, y: 580, width: 700, height: 60 }, confidence: 0.45 },
    { text: 'How much ribbon is left?', boundingBox: { x: 120, y: 660, width: 1000, height: 60 }, confidence: 0.72 },
  ];

  const handleDone = useCallback(
    (items: ManualInputItem[], subject: Subject) => {
      router.replace({
        pathname: '/(kid)/camera-result',
        params: { photoUri: params.photoUri, subject, correctedItems: JSON.stringify(items) },
      });
    },
    [params.photoUri],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  return (
    <ManualInputScreen
      photoUri={params.photoUri}
      blocks={mockLowConfBlocks}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
      onDone={handleDone}
      onBack={handleBack}
    />
  );
}
