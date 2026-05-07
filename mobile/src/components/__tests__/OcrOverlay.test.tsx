import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OcrOverlay from '../OcrOverlay';
import type { OcrBlock } from '../../models/ocr';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

function fireLayout(component: any) {
  fireEvent(component.getByTestId('ocr-overlay-container'), 'layout', {
    nativeEvent: { layout: { width: 400, height: 600 } },
  });
}

const mockBlocks: OcrBlock[] = [
  { text: 'Q1: What is 2+2?', boundingBox: { x: 100, y: 200, width: 800, height: 60 }, confidence: 0.95 },
  { text: 'Answer:', boundingBox: { x: 100, y: 280, width: 300, height: 50 }, confidence: 0.45 },
  { text: 'Q2: Solve 5x = 25', boundingBox: { x: 100, y: 400, width: 700, height: 55 }, confidence: 0.72 },
];

describe('OcrOverlay', () => {
  it('renders without crashing', () => {
    expect(render(
      <OcrOverlay imageSource={{ uri: 'file://test.jpg' }} blocks={mockBlocks} imageWidth={1920} imageHeight={1080} />,
    ).toJSON()).toBeTruthy();
  });

  it('shows confidence badges after layout', () => {
    const r = render(<OcrOverlay imageSource={{ uri: 'file://test.jpg' }} blocks={mockBlocks} imageWidth={1920} imageHeight={1080} />);
    fireLayout(r);
    expect(r.getByText('95%')).toBeTruthy();
    expect(r.getByText('45%')).toBeTruthy();
    expect(r.getByText('72%')).toBeTruthy();
  });

  it('renders empty state with retry prompt when no blocks', () => {
    const r = render(
      <OcrOverlay imageSource={{ uri: 'file://test.jpg' }} blocks={[]} imageWidth={1920} imageHeight={1080} onRetake={jest.fn()} />,
    );
    expect(r.getByText('Unable to read text')).toBeTruthy();
    expect(r.getByText('Retake photo')).toBeTruthy();
  });

  it('renders empty state without retake button when onRetake not provided', () => {
    const r = render(
      <OcrOverlay imageSource={{ uri: 'file://test.jpg' }} blocks={[]} imageWidth={1920} imageHeight={1080} />,
    );
    expect(r.getByText('Unable to read text')).toBeTruthy();
  });

  it('renders low confidence "Tap to type" badge', () => {
    const r = render(<OcrOverlay imageSource={{ uri: 'file://test.jpg' }} blocks={[{ text: 'Low conf', boundingBox: { x: 0, y: 0, width: 100, height: 20 }, confidence: 0.45 }]} imageWidth={1920} imageHeight={1080} />);
    fireLayout(r);
    expect(r.getByText('45%')).toBeTruthy();
    expect(r.getByText('Tap to type')).toBeTruthy();
  });

  it('renders single block without Tap to type for high confidence', () => {
    const r = render(<OcrOverlay imageSource={{ uri: 'file://test.jpg' }} blocks={[{ text: 'Solo', boundingBox: { x: 0, y: 0, width: 100, height: 20 }, confidence: 0.88 }]} imageWidth={1920} imageHeight={1080} />);
    fireLayout(r);
    expect(r.getByText('88%')).toBeTruthy();
  });

  it('renders mixed confidence levels', () => {
    const r = render(<OcrOverlay imageSource={{ uri: 'file://test.jpg' }} blocks={[
      { text: 'High', boundingBox: { x: 0, y: 0, width: 100, height: 20 }, confidence: 0.9 },
      { text: 'Low', boundingBox: { x: 0, y: 30, width: 100, height: 20 }, confidence: 0.15 },
    ]} imageWidth={1920} imageHeight={1080} />);
    fireLayout(r);
    expect(r.getByText('90%')).toBeTruthy();
    expect(r.getByText('15%')).toBeTruthy();
  });

  it('calls onBlockPress when a block is pressed', () => {
    const onBlockPress = jest.fn();
    const r = render(<OcrOverlay imageSource={{ uri: 'file://test.jpg' }} blocks={mockBlocks} imageWidth={1920} imageHeight={1080} onBlockPress={onBlockPress} />);
    fireLayout(r);
    fireEvent.press(r.getByText('45%'));
    expect(onBlockPress).toHaveBeenCalledWith(1);
  });
});
