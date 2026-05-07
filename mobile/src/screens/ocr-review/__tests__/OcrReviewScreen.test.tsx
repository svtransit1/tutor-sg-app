import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OcrReviewScreen from '../OcrReviewScreen';
import type { OcrBlock } from '../../../models/ocr';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), replace: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));

const blocks: OcrBlock[] = [
  { text: 'What is capital of France?', boundingBox: { x: 100, y: 200, width: 800, height: 60 }, confidence: 0.95 },
  { text: 'A. London B. Paris C. Berlin', boundingBox: { x: 100, y: 280, width: 900, height: 50 }, confidence: 0.88 },
  { text: 'Answer:', boundingBox: { x: 100, y: 360, width: 300, height: 40 }, confidence: 0.42 },
];

describe('OcrReviewScreen', () => {
  const onConfirm = jest.fn();
  const onRetake = jest.fn();
  beforeEach(() => jest.clearAllMocks());

  const renderScreen = (overrides = {}) => render(
    <OcrReviewScreen photoUri="file://test.jpg" blocks={blocks} imageWidth={1920} imageHeight={1080} onConfirm={onConfirm} onRetake={onRetake} {...overrides} />
  );

  it('renders title', () => expect(renderScreen().getByText('ocrReview.title')).toBeTruthy());
  it('renders retake button', () => expect(renderScreen().getByText('ocrReview.retake')).toBeTruthy());
  it('renders confirm button', () => expect(renderScreen().getByText('ocrReview.confirm')).toBeTruthy());
  it('renders block text', () => {
    const r = renderScreen();
    expect(r.getByText('What is capital of France?')).toBeTruthy();
    expect(r.getByText('A. London B. Paris C. Berlin')).toBeTruthy();
    expect(r.getByText('Answer:')).toBeTruthy();
  });
  it('renders confidence badges', () => {
    const r = renderScreen();
    expect(r.getByText('95%')).toBeTruthy();
    expect(r.getByText('88%')).toBeTruthy();
    expect(r.getByText('42%')).toBeTruthy();
  });
  it('renders detected regions header', () => expect(renderScreen().getByText('ocrReview.detectedRegions')).toBeTruthy());
  it('shows manual notice when confidence not all high', () => expect(renderScreen().getByText('ocrReview.manualInputNotice')).toBeTruthy());
  it('hides manual notice when all high confidence', () => {
    const { queryByText } = renderScreen({ blocks: [{ text: 'Perfect', boundingBox: { x: 0, y: 0, width: 100, height: 20 }, confidence: 0.95 }] });
    expect(queryByText('ocrReview.manualInputNotice')).toBeNull();
  });
  it('calls onRetake on press', () => { fireEvent.press(renderScreen().getByText('ocrReview.retake')); expect(onRetake).toHaveBeenCalledTimes(1); });
  it('calls onConfirm on press', () => { fireEvent.press(renderScreen().getByText('ocrReview.confirm')); expect(onConfirm).toHaveBeenCalledTimes(1); });
  it('renders single block', () => {
    const r = renderScreen({ blocks: [{ text: 'Single', boundingBox: { x: 0, y: 0, width: 100, height: 20 }, confidence: 0.99 }] });
    expect(r.getByText('Single')).toBeTruthy();
    expect(r.getByText('99%')).toBeTruthy();
  });
});
