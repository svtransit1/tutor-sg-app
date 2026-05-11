import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { FirstUseWalkthrough } from '../FirstUseWalkthrough';

describe('FirstUseWalkthrough', () => {
  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();

  function renderOverlay(visible: boolean = true) {
    return render(
      <FirstUseWalkthrough visible={visible} onComplete={mockOnComplete} onSkip={mockOnSkip} />,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders first step content when visible', () => {
    renderOverlay();
    expect(screen.getByText('tutorial.camera.title')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = renderOverlay(false);
    expect(queryByText('tutorial.camera.title')).toBeNull();
  });

  it('shows Skip and Next buttons on non-final steps', () => {
    renderOverlay();
    expect(screen.getByText('tutorial.skip')).toBeTruthy();
    expect(screen.getByText('tutorial.next')).toBeTruthy();
  });

  it('advances to step 2 when Next is pressed', () => {
    renderOverlay();
    act(() => {
      fireEvent.press(screen.getByText('tutorial.next'));
    });
    expect(screen.getByText('tutorial.help.title')).toBeTruthy();
  });

  it('advances to step 3 when Next is pressed twice', () => {
    renderOverlay();
    act(() => {
      fireEvent.press(screen.getByText('tutorial.next'));
      fireEvent.press(screen.getByText('tutorial.next'));
    });
    expect(screen.getByText('tutorial.language.title')).toBeTruthy();
  });

  it('shows Got it! button on final step', () => {
    renderOverlay();
    act(() => {
      fireEvent.press(screen.getByText('tutorial.next'));
      fireEvent.press(screen.getByText('tutorial.next'));
    });
    expect(screen.getByText('tutorial.gotIt')).toBeTruthy();
    expect(() => screen.getByText('tutorial.next')).toThrow();
  });

  it('calls onComplete when Got it! is pressed', () => {
    renderOverlay();
    act(() => {
      fireEvent.press(screen.getByText('tutorial.next'));
      fireEvent.press(screen.getByText('tutorial.next'));
    });
    act(() => {
      fireEvent.press(screen.getByText('tutorial.gotIt'));
    });
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when Skip is pressed', () => {
    renderOverlay();
    act(() => {
      fireEvent.press(screen.getByText('tutorial.skip'));
    });
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when backdrop is pressed', () => {
    renderOverlay();
    act(() => {
      fireEvent.press(screen.getByLabelText('tutorial.skipA11y'));
    });
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('resets to step 1 when reopened', () => {
    const { rerender } = render(
      <FirstUseWalkthrough visible={true} onComplete={mockOnComplete} onSkip={mockOnSkip} />,
    );
    act(() => {
      fireEvent.press(screen.getByText('tutorial.next'));
    });
    expect(screen.getByText('tutorial.help.title')).toBeTruthy();
    rerender(
      <FirstUseWalkthrough visible={false} onComplete={mockOnComplete} onSkip={mockOnSkip} />,
    );
    rerender(
      <FirstUseWalkthrough visible={true} onComplete={mockOnComplete} onSkip={mockOnSkip} />,
    );
    expect(screen.getByText('tutorial.camera.title')).toBeTruthy();
  });

  it('has accessibility labels', () => {
    renderOverlay();
    expect(screen.getByLabelText('tutorial.skipA11y')).toBeTruthy();
    expect(screen.getByLabelText('tutorial.next')).toBeTruthy();
    expect(screen.getByLabelText('tutorial.stepIndicator')).toBeTruthy();
  });
});
