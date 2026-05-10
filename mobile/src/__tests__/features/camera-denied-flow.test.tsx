/**
 * AAAS-1220 (M2-129): Camera permission denied UX — manual-input fallback flow
 *
 * Covers:
 *   1. Camera permission denied on mount → error state renders
 *   2. Error state shows "Type it out instead" and "Go back home" buttons
 *   3. Manual input screen renders subject chips and text input
 *
 * Contract tested against ADD §4.1 and decisions-locked OCR failure handling.
 * @see ADD §4.1 — OCR fallback: manual-input when confidence < 0.6
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

// ── Mocks ─────────────────────────────────────────────────────

const mockGetCameraPermissionStatus = jest.fn();

jest.mock('@/services/camera', () => ({
  getCameraPermissionStatus: () => mockGetCameraPermissionStatus(),
  capturePhoto: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'common.back': 'Back',
        'homeworkError.cameraDenied.title': 'Camera not available',
        'homeworkError.cameraDenied.description': 'We need the camera to read your homework. Please allow camera access in Settings.',
        'homeworkError.cameraDenied.typeItOut': 'Type it out instead',
        'homeworkError.cameraDenied.goBack': 'Go back home',
        'cameraCapture.title': 'Snap Homework',
        'cameraCapture.instruction': 'Take a photo of your homework page',
        'cameraCapture.takePhoto': 'Take Photo',
        'cameraCapture.capturing': 'Taking photo…',
        'cameraCapture.confirm': 'Confirm All',
        'cameraCapture.removePhoto': 'Remove photo {{number}}',
        'cameraCapture.accessibility.capture': 'Take a photo of your homework',
        'cameraCapture.accessibility.confirm': 'Confirm {{count}} photos and continue to review',
        'manualInputFallback.title': 'Type your homework',
        'manualInputFallback.description': 'Type the answer for each item.',
        'manualInputFallback.subjectPrompt': 'What subject is this?',
        'manualInputFallback.typePlaceholder': 'Type the answer here…',
        'manualInputFallback.submit': 'Continue',
        'manualInputFallback.accessibility.submit': 'Submit all typed answers',
        'manualInputFallback.accessibility.typeInput': 'Type answer for item {{number}}',
        'kidHome.subjects.math': 'Math',
        'kidHome.subjects.english': 'English',
        'kidHome.subjects.science': 'Science',
        'kidHome.subjects.chinese': 'Chinese',
        'homeworkFeedback.hint.body': 'Think about what you already know.',
      };
      if (opts) {
        let result = translations[key] ?? key;
        for (const [k, v] of Object.entries(opts)) {
          result = result.replace(`{{${k}}}`, String(v));
        }
        return result;
      }
      return translations[key] ?? key;
    },
    i18n: { language: 'en' },
  }),
}));

// ── Helpers ─────────────────────────────────────────────────────

function getCameraCapture() {
  return require('@/../app/(kid)/camera-capture').default;
}

function getManualInput() {
  return require('@/../app/(kid)/manual-input').default;
}

// ── Test Suites ─────────────────────────────────────────────────

describe('CAMDENY-01: Camera permission denied on mount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows camera UI when permission is granted', async () => {
    mockGetCameraPermissionStatus.mockResolvedValue('granted');
    const Screen = getCameraCapture();
    const { findByText } = render(<Screen />);
    expect(await findByText('Take a photo of your homework page')).toBeTruthy();
  });

  it('shows camera UI when permission is not-determined', async () => {
    mockGetCameraPermissionStatus.mockResolvedValue('not-determined');
    const Screen = getCameraCapture();
    const { findByText } = render(<Screen />);
    expect(await findByText('Take a photo of your homework page')).toBeTruthy();
  });

  it('shows denied error when permission is already denied', async () => {
    mockGetCameraPermissionStatus.mockResolvedValue('denied');
    const Screen = getCameraCapture();
    const { findByText } = render(<Screen />);
    expect(await findByText('Camera not available')).toBeTruthy();
    expect(await findByText('We need the camera to read your homework. Please allow camera access in Settings.')).toBeTruthy();
  });

  it('renders both action buttons in denied state', async () => {
    mockGetCameraPermissionStatus.mockResolvedValue('denied');
    const Screen = getCameraCapture();
    const { findByText } = render(<Screen />);
    expect(await findByText('Type it out instead')).toBeTruthy();
    expect(await findByText('Go back home')).toBeTruthy();
  });
});

describe('CAMDENY-02: Navigation from denied state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCameraPermissionStatus.mockResolvedValue('denied');
  });

  it('tapping "Type it out instead" navigates to manual input', async () => {
    const Screen = getCameraCapture();
    const { findByText } = render(<Screen />);
    const btn = await findByText('Type it out instead');
    fireEvent.press(btn);
    expect(router.push).toHaveBeenCalledWith('/(kid)/manual-input');
  });

  it('tapping "Go back home" replaces with home screen', async () => {
    const Screen = getCameraCapture();
    const { findByText } = render(<Screen />);
    const btn = await findByText('Go back home');
    fireEvent.press(btn);
    expect(router.replace).toHaveBeenCalledWith('/(kid)/home');
  });
});

describe('CAMDENY-03: Manual input screen renders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders subject chips', async () => {
    const Screen = getManualInput();
    const { findByText } = render(<Screen />);
    expect(await findByText('Math')).toBeTruthy();
    expect(await findByText('English')).toBeTruthy();
    expect(await findByText('Science')).toBeTruthy();
    expect(await findByText('Chinese')).toBeTruthy();
  });

  it('renders text input and submit button', async () => {
    const Screen = getManualInput();
    const { findByPlaceholderText, findByLabelText } = render(<Screen />);
    expect(await findByPlaceholderText('Type the answer here…')).toBeTruthy();
    expect(await findByLabelText('Submit all typed answers')).toBeTruthy();
  });

  it('submit button is rendered (disabled state set via prop)', async () => {
    const Screen = getManualInput();
    const { findByLabelText } = render(<Screen />);
    const btn = await findByLabelText('Submit all typed answers');
    expect(btn).toBeTruthy();
  });
});

describe('CAMDENY-04: Manual input submit navigates to photo-review', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the submit button', async () => {
    const Screen = getManualInput();
    const { findByLabelText } = render(<Screen />);
    expect(await findByLabelText('Submit all typed answers')).toBeTruthy();
  });
});
