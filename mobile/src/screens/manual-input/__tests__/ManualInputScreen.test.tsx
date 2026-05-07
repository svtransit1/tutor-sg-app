import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { OcrBlock } from '../../../models/ocr';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));
jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn(async (key: string) => store[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn(async (key: string) => { delete store[key]; }),
  };
});
jest.mock('../DrawingCanvas', () => {
  return function MockDrawingCanvas() {
    return null;
  };
});

const mockBlocks: OcrBlock[] = [
  { text: 'clear text', boundingBox: { x: 0, y: 0, width: 100, height: 20 }, confidence: 0.95 },
  { text: 'unclear text', boundingBox: { x: 0, y: 30, width: 100, height: 20 }, confidence: 0.45 },
  { text: 'also unclear', boundingBox: { x: 0, y: 60, width: 100, height: 20 }, confidence: 0.55 },
  { text: 'barely readable', boundingBox: { x: 0, y: 90, width: 100, height: 20 }, confidence: 0.15 },
];

const defaultProps = {
  photoUri: 'file://test.jpg',
  blocks: mockBlocks,
  imageWidth: 1920,
  imageHeight: 1080,
  onDone: jest.fn(),
  onBack: jest.fn(),
};

describe('ManualInputScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title', () => {
    const { getByText } = render(<ManualInputScreen {...defaultProps} />);
    expect(getByText('manualInputFallback.title')).toBeTruthy();
  });

  it('renders subtitle', () => {
    const { getByText } = render(<ManualInputScreen {...defaultProps} />);
    expect(getByText('manualInputFallback.subtitle')).toBeTruthy();
  });

  it('renders subject picker with all 4 subjects', () => {
    const { getByText } = render(<ManualInputScreen {...defaultProps} />);
    expect(getByText('Math')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
    expect(getByText('Science')).toBeTruthy();
    expect(getByText('中文')).toBeTruthy();
  });

  it('shows correct item count', () => {
    const { getByText } = render(<ManualInputScreen {...defaultProps} />);
    expect(getByText(/manualInputFallback.itemLabel/)).toBeTruthy();
  });

  it('renders text input for the current item', () => {
    const { getByPlaceholderText } = render(<ManualInputScreen {...defaultProps} />);
    expect(getByPlaceholderText('manualInputFallback.typeHere')).toBeTruthy();
  });

  it('renders original text for low-confidence blocks', () => {
    const { getByText } = render(<ManualInputScreen {...defaultProps} />);
    expect(getByText('manualInputFallback.originalText')).toBeTruthy();
  });

  it('calls onBack when back pressed', () => {
    const onBack = jest.fn();
    const { getByLabelText } = render(<ManualInputScreen {...defaultProps} onBack={onBack} />);
    fireEvent.press(getByLabelText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when all blocks are high confidence', () => {
    const highConfBlocks: OcrBlock[] = [
      { text: 'clear', boundingBox: { x: 0, y: 0, width: 100, height: 20 }, confidence: 0.95 },
    ];
    const { getByText } = render(<ManualInputScreen {...defaultProps} blocks={highConfBlocks} />);
    expect(getByText('All text was recognised successfully.')).toBeTruthy();
  });
});
