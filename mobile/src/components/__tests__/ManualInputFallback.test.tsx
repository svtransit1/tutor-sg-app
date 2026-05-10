import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ManualInputFallback from '../ManualInputFallback';

// Mock i18n that returns key for simple lookups and ignores interpolation params
const mockT = (key: string, _fallback?: string) => key;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT, i18n: { language: 'en', changeLanguage: jest.fn() } }),
}));

const FAILED_ITEMS = [1, 3, 5];

describe('ManualInputFallback', () => {
  const mockOnSkipItem = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnDismissError = jest.fn();

  function renderDefault() {
    return render(
      <ManualInputFallback
        failedItems={FAILED_ITEMS}
        onSkipItem={mockOnSkipItem}
        onSubmit={mockOnSubmit}
      />,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic render', () => {
    it('renders title from i18n', () => {
      renderDefault();
      expect(screen.getByText('manualInputFallback.title')).toBeTruthy();
    });

    it('renders description from i18n', () => {
      renderDefault();
      expect(screen.getByText('manualInputFallback.description')).toBeTruthy();
    });

    it('renders a card for each failed item', () => {
      renderDefault();
      expect(screen.getAllByText('manualInputFallback.itemLabel').length).toBe(FAILED_ITEMS.length);
    });

    it('renders type and draw tabs', () => {
      renderDefault();
      expect(screen.getAllByText('manualInputFallback.typeTab').length).toBe(FAILED_ITEMS.length);
      expect(screen.getAllByText('manualInputFallback.drawTab').length).toBe(FAILED_ITEMS.length);
    });

    it('renders submit button', () => {
      renderDefault();
      expect(screen.getByText('manualInputFallback.submit')).toBeTruthy();
    });

    it('renders clear and skip action buttons per item', () => {
      renderDefault();
      expect(screen.getAllByText('manualInputFallback.clear').length).toBe(FAILED_ITEMS.length);
      expect(screen.getAllByText('manualInputFallback.skip').length).toBe(FAILED_ITEMS.length);
    });

    it('renders text input for each item in type mode', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      expect(inputs.length).toBe(FAILED_ITEMS.length);
    });
  });

  describe('tab switching', () => {
    it('switches to draw tab when draw is pressed', () => {
      renderDefault();
      const drawTabs = screen.getAllByText('manualInputFallback.drawTab');
      fireEvent.press(drawTabs[0]);
      expect(screen.getAllByText('manualInputFallback.drawPlaceholder').length).toBe(1);
    });

    it('switches back to type tab when type is pressed', () => {
      renderDefault();
      const drawTabs = screen.getAllByText('manualInputFallback.drawTab');
      fireEvent.press(drawTabs[0]);
      const typeTabs = screen.getAllByText('manualInputFallback.typeTab');
      fireEvent.press(typeTabs[0]);
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      expect(inputs.length).toBe(FAILED_ITEMS.length);
    });

    it('tracks active tab independently per item', () => {
      renderDefault();
      const drawTabs = screen.getAllByText('manualInputFallback.drawTab');
      fireEvent.press(drawTabs[0]);
      fireEvent.press(drawTabs[2]);
      const drawAreas = screen.getAllByText('manualInputFallback.drawPlaceholder');
      expect(drawAreas.length).toBe(2);
    });
  });

  describe('text input', () => {
    it('accepts text input for an item', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(inputs[0], '42');
      expect(inputs[0].props.value).toBe('42');
    });

    it('accepts text input for multiple items', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(inputs[0], 'answer 1');
      fireEvent.changeText(inputs[1], 'answer 3');
      fireEvent.changeText(inputs[2], 'answer 5');
      expect(inputs[0].props.value).toBe('answer 1');
      expect(inputs[1].props.value).toBe('answer 3');
      expect(inputs[2].props.value).toBe('answer 5');
    });

    it('calls onDismissError when typing after error', () => {
      render(
        <ManualInputFallback
          failedItems={[1]}
          error="noInputs"
          onSkipItem={mockOnSkipItem}
          onSubmit={mockOnSubmit}
          onDismissError={mockOnDismissError}
        />,
      );
      const input = screen.getByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(input, 'typing');
      expect(mockOnDismissError).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear', () => {
    it('clears text input for an item', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(inputs[0], 'some answer');
      const clearBtns = screen.getAllByText('manualInputFallback.clear');
      fireEvent.press(clearBtns[0]);
      expect(inputs[0].props.value).toBe('');
    });

    it('clears only the targeted item', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(inputs[0], 'keep this');
      fireEvent.changeText(inputs[1], 'clear this');
      const clearBtns = screen.getAllByText('manualInputFallback.clear');
      fireEvent.press(clearBtns[1]);
      expect(inputs[0].props.value).toBe('keep this');
      expect(inputs[1].props.value).toBe('');
    });
  });

  describe('skip', () => {
    it('calls onSkipItem with the item number when skip is pressed', () => {
      renderDefault();
      const skipBtns = screen.getAllByText('manualInputFallback.skip');
      fireEvent.press(skipBtns[1]);
      expect(mockOnSkipItem).toHaveBeenCalledWith(3);
    });

    it('calls onSkipItem separately per item', () => {
      renderDefault();
      const skipBtns = screen.getAllByText('manualInputFallback.skip');
      fireEvent.press(skipBtns[0]);
      fireEvent.press(skipBtns[2]);
      expect(mockOnSkipItem).toHaveBeenCalledWith(1);
      expect(mockOnSkipItem).toHaveBeenCalledWith(5);
      expect(mockOnSkipItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('submit', () => {
    it('is disabled when not all items are filled', () => {
      renderDefault();
      const submitBtn = screen.getByText('manualInputFallback.submit');
      expect(submitBtn).toBeTruthy();
    });

    it('calls onSubmit with answers when all items are filled', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(inputs[0], 'twelve');
      fireEvent.changeText(inputs[1], 'thirty');
      fireEvent.changeText(inputs[2], 'fifty');
      fireEvent.press(screen.getByText('manualInputFallback.submit'));
      expect(mockOnSubmit).toHaveBeenCalledWith({ 1: 'twelve', 3: 'thirty', 5: 'fifty' });
    });

    it('does not call onSubmit when not all items are filled', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(inputs[0], 'only one');
      fireEvent.press(screen.getByText('manualInputFallback.submit'));
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('trims whitespace when checking if items are filled', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(inputs[0], '  ');
      fireEvent.changeText(inputs[1], '  ');
      fireEvent.changeText(inputs[2], 'valid');
      const submitBtn = screen.getByText('manualInputFallback.submit');
      expect(submitBtn).toBeTruthy();
    });
  });

  describe('remaining count', () => {
    it('shows remaining count when not all items are filled', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(inputs[0], 'filled one');
      expect(screen.getByText('manualInputFallback.remaining')).toBeTruthy();
    });

    it('shows empty remaining text when all items are filled', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(inputs[0], 'a');
      fireEvent.changeText(inputs[1], 'b');
      fireEvent.changeText(inputs[2], 'c');
      expect(screen.queryByText('manualInputFallback.remaining')).toBeNull();
    });
  });

  describe('error states', () => {
    it('renders parseFailed error banner when error="parseFailed"', () => {
      render(
        <ManualInputFallback
          failedItems={[1]}
          error="parseFailed"
          onSkipItem={mockOnSkipItem}
          onSubmit={mockOnSubmit}
        />,
      );
      expect(screen.getByText('manualInputFallback.error.parseFailed')).toBeTruthy();
    });

    it('renders noInputs error banner when error="noInputs"', () => {
      render(
        <ManualInputFallback
          failedItems={[1]}
          error="noInputs"
          onSkipItem={mockOnSkipItem}
          onSubmit={mockOnSubmit}
        />,
      );
      expect(screen.getByText('manualInputFallback.error.noInputs')).toBeTruthy();
    });

    it('does not render error banner when error is null', () => {
      renderDefault();
      expect(screen.queryByText('manualInputFallback.error.parseFailed')).toBeNull();
      expect(screen.queryByText('manualInputFallback.error.noInputs')).toBeNull();
    });

    it('error banner has accessibility role alert', () => {
      render(
        <ManualInputFallback
          failedItems={[1]}
          error="parseFailed"
          onSkipItem={mockOnSkipItem}
          onSubmit={mockOnSubmit}
        />,
      );
      const alert = screen.getByLabelText('manualInputFallback.error.parseFailed');
      expect(alert.props.accessibilityRole).toBe('alert');
    });
  });

  describe('back button', () => {
    it('renders back button when onBack is provided', () => {
      render(
        <ManualInputFallback
          failedItems={[1]}
          onSkipItem={mockOnSkipItem}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />,
      );
      expect(screen.getByLabelText('manualInputFallback.accessibility.back')).toBeTruthy();
    });

    it('does not render back button when onBack is not provided', () => {
      renderDefault();
      expect(screen.queryByLabelText('manualInputFallback.accessibility.back')).toBeNull();
    });

    it('calls onBack when back button is pressed', () => {
      render(
        <ManualInputFallback
          failedItems={[1]}
          onSkipItem={mockOnSkipItem}
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
        />,
      );
      fireEvent.press(screen.getByLabelText('manualInputFallback.accessibility.back'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('handles empty failedItems gracefully', () => {
      const { toJSON } = render(
        <ManualInputFallback
          failedItems={[]}
          onSkipItem={mockOnSkipItem}
          onSubmit={mockOnSubmit}
        />,
      );
      expect(toJSON()).toBeTruthy();
      expect(screen.queryByText('manualInputFallback.itemLabel')).toBeNull();
    });

    it('renders correctly with a single failed item', () => {
      render(
        <ManualInputFallback
          failedItems={[2]}
          onSkipItem={mockOnSkipItem}
          onSubmit={mockOnSubmit}
        />,
      );
      expect(screen.getAllByText('manualInputFallback.typeTab').length).toBe(1);
      expect(screen.getAllByText('manualInputFallback.drawTab').length).toBe(1);
    });

    it('handles non-sequential item numbers', () => {
      render(
        <ManualInputFallback
          failedItems={[2, 7, 11]}
          onSkipItem={mockOnSkipItem}
          onSubmit={mockOnSubmit}
        />,
      );
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(inputs[0], 'a2');
      fireEvent.changeText(inputs[1], 'a7');
      fireEvent.changeText(inputs[2], 'a11');
      fireEvent.press(screen.getByText('manualInputFallback.submit'));
      expect(mockOnSubmit).toHaveBeenCalledWith({ 2: 'a2', 7: 'a7', 11: 'a11' });
    });

    it('handles clears after submit state', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(/manualInputFallback\.accessibility\.typeInput/);
      fireEvent.changeText(inputs[0], 'some');
      fireEvent.changeText(inputs[1], 'answers');
      fireEvent.changeText(inputs[2], 'here');
      const clearBtns = screen.getAllByText('manualInputFallback.clear');
      fireEvent.press(clearBtns[0]);
      fireEvent.press(clearBtns[1]);
      const remainingText = screen.getByText('manualInputFallback.remaining');
      expect(remainingText).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('submit button has accessibility label', () => {
      renderDefault();
      expect(screen.getByLabelText('manualInputFallback.accessibility.submit')).toBeTruthy();
    });

    it('submit button has accessibility state disabled when not all filled', () => {
      renderDefault();
      const submitBtn = screen.getByLabelText('manualInputFallback.accessibility.submit');
      expect(submitBtn.props.accessibilityState?.disabled).toBe(true);
    });

    it('skip buttons have accessibility label', () => {
      renderDefault();
      const skipBtns = screen.getAllByLabelText('manualInputFallback.accessibility.skip');
      expect(skipBtns.length).toBe(FAILED_ITEMS.length);
    });

    it('clear buttons have accessibility label', () => {
      renderDefault();
      const clearBtns = screen.getAllByLabelText('manualInputFallback.clear');
      expect(clearBtns.length).toBe(FAILED_ITEMS.length);
    });

    it('tab buttons have accessibility state selected', () => {
      renderDefault();
      const typeTabs = screen.getAllByLabelText('manualInputFallback.typeTab');
      expect(typeTabs[0].props.accessibilityState?.selected).toBe(true);
    });

    it('type inputs have accessibility label per item', () => {
      renderDefault();
      const inputs = screen.getAllByLabelText(
        /manualInputFallback\.accessibility\.typeInput/,
      );
      expect(inputs[0].props.accessibilityLabel).toBe(
        'manualInputFallback.accessibility.typeInput',
      );
    });

    it('draw canvas has accessibility label per item', () => {
      renderDefault();
      const drawTabs = screen.getAllByText('manualInputFallback.drawTab');
      fireEvent.press(drawTabs[0]);
      const canvas = screen.getByLabelText('manualInputFallback.accessibility.drawCanvas');
      expect(canvas).toBeTruthy();
    });
  });
});
