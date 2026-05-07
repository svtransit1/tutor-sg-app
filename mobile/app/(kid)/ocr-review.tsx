import React, { useCallback } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import OcrReviewScreen from '../../src/screens/ocr-review/OcrReviewScreen';

export default function OcrReviewRoute() {
  const params = useLocalSearchParams<{ photoUri: string; imageWidth?: string; imageHeight?: string }>();
  if (!params.photoUri) return null;

  const iw = params.imageWidth ? parseInt(params.imageWidth, 10) : 1920;
  const ih = params.imageHeight ? parseInt(params.imageHeight, 10) : 1080;
  const blocks = [
    { text: 'John ate 1/3 of a pizza and his sister ate 2/5.', boundingBox: { x: 120, y: 200, width: 1500, height: 80 }, confidence: 0.92 },
    { text: 'How much pizza did they eat altogether?', boundingBox: { x: 120, y: 300, width: 1200, height: 60 }, confidence: 0.88 },
    { text: 'A ribbon is 3/4 m long.', boundingBox: { x: 120, y: 500, width: 900, height: 60 }, confidence: 0.95 },
    { text: 'Mary cut off 1/3 m.', boundingBox: { x: 120, y: 580, width: 700, height: 60 }, confidence: 0.45 },
    { text: 'How much ribbon is left?', boundingBox: { x: 120, y: 660, width: 1000, height: 60 }, confidence: 0.72 },
  ];

  const handleBlockPress = useCallback(
    (index: number) => {
      router.push({
        pathname: '/(kid)/manual-input',
        params: { photoUri: params.photoUri, focusIndex: String(index) },
      });
    },
    [params.photoUri],
  );

  return (
    <OcrReviewScreen
      photoUri={params.photoUri} blocks={blocks} imageWidth={iw} imageHeight={ih}
      onConfirm={() => router.replace({ pathname: '/(kid)/camera-result', params: { photoUri: params.photoUri } })}
      onRetake={() => router.back()}
      onBlockPress={handleBlockPress}
    />
  );
}
