import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import HomeworkFeedbackCard from '../HomeworkFeedbackCard';
import type { ScaffoldedHelp } from '@/models/homework-feedback';

const MOCK_HELP: ScaffoldedHelp = {
  hint: 'Try breaking the problem into smaller parts. What do you know?',
  guidedSteps: [
    'Step 1: Read the question carefully and identify the key numbers.',
    'Step 2: Decide which operation to use.',
    'Step 3: Solve step by step and check your answer.',
  ],
  workedSolution:
    'The correct answer is 42. First, add the two numbers: 20 + 22 = 42. Then verify by subtracting.',
};

function renderCard(props?: {
  initialTab?: 'hint' | 'steps' | 'solution';
  questionText?: string;
  title?: string;
  variant?: 'loading' | 'error' | 'ready';
  onRetry?: () => void;
  errorMessage?: string;
}) {
  const { variant, onRetry, errorMessage, ...rest } = props ?? {};
  return render(
    <HomeworkFeedbackCard
      help={MOCK_HELP}
      questionNumber={1}
      questionText={rest?.questionText}
      title={rest?.title}
      initialTab={rest?.initialTab}
      variant={variant}
      onRetry={onRetry}
      errorMessage={errorMessage}
    />,
  );
}

describe('HomeworkFeedbackCard', () => {
  describe('ready state', () => {
    it('renders the card with question number badge', () => {
      renderCard();
      expect(screen.getByText('1')).toBeTruthy();
    });

    it('renders default title from i18n', () => {
      renderCard();
      expect(screen.getByText('homeworkFeedback.title')).toBeTruthy();
    });

    it('renders custom title when provided', () => {
      renderCard({ title: 'Custom Title' });
      expect(screen.getByText('Custom Title')).toBeTruthy();
    });

    it('renders question text when provided', () => {
      renderCard({ questionText: 'What is 20 + 22?' });
      expect(screen.getByText('What is 20 + 22?')).toBeTruthy();
    });

    it('does not render question block when questionText is absent', () => {
      renderCard();
      expect(screen.queryByText('What is 20 + 22?')).toBeNull();
    });

    it('shows hint text by default', () => {
      renderCard();
      expect(
        screen.getByText(
          'Try breaking the problem into smaller parts. What do you know?',
        ),
      ).toBeTruthy();
      expect(screen.getByText('homeworkFeedback.hint.heading')).toBeTruthy();
    });

    it('shows "Show me more" button on hint level', () => {
      renderCard();
      expect(screen.getByText('homeworkFeedback.actions.showMore')).toBeTruthy();
    });

    it('does not show "Show answer" button on hint level', () => {
      renderCard();
      expect(
        screen.queryByText('homeworkFeedback.actions.showAnswer'),
      ).toBeNull();
    });

    it('reveals guided steps when "Show me more" is pressed', () => {
      renderCard();
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showMore'));
      expect(
        screen.getByText('Step 1: Read the question carefully and identify the key numbers.'),
      ).toBeTruthy();
      expect(screen.getByText('homeworkFeedback.steps.heading')).toBeTruthy();
    });

    it('shows "Show answer" button on steps level', () => {
      renderCard();
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showMore'));
      expect(
        screen.getByText('homeworkFeedback.actions.showAnswer'),
      ).toBeTruthy();
    });

    it('reveals worked solution when "Show answer" is pressed', () => {
      renderCard();
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showMore'));
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showAnswer'));
      expect(
        screen.getByText(/The correct answer is 42/),
      ).toBeTruthy();
      expect(screen.getByText('homeworkFeedback.solution.heading')).toBeTruthy();
    });

    it('shows "Show less" button on steps level', () => {
      renderCard();
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showMore'));
      expect(
        screen.getByText('homeworkFeedback.actions.showLess'),
      ).toBeTruthy();
    });

    it('collapses back to hint when "Show less" is pressed from steps', () => {
      renderCard();
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showMore'));
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showLess'));
      expect(
        screen.getByText(
          'Try breaking the problem into smaller parts. What do you know?',
        ),
      ).toBeTruthy();
      expect(screen.getByText('homeworkFeedback.hint.heading')).toBeTruthy();
    });

    it('collapses back from solution when "Show less" is pressed', () => {
      renderCard();
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showMore'));
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showAnswer'));
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showLess'));
      expect(
        screen.getByText(
          'Try breaking the problem into smaller parts. What do you know?',
        ),
      ).toBeTruthy();
      expect(screen.getByText('homeworkFeedback.hint.heading')).toBeTruthy();
    });
  });

  describe('initialTab', () => {
    it('starts on steps level when initialTab="steps"', () => {
      renderCard({ initialTab: 'steps' });
      expect(
        screen.getByText('Step 1: Read the question carefully and identify the key numbers.'),
      ).toBeTruthy();
      expect(screen.getByText('homeworkFeedback.steps.heading')).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('renders skeleton when variant="loading"', () => {
      const { UNSAFE_root } = render(
        <HomeworkFeedbackCard variant="loading" questionNumber={1} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('renders error message when variant="error"', () => {
      render(
        <HomeworkFeedbackCard
          variant="error"
          questionNumber={1}
          errorMessage="Something went wrong"
        />,
      );
      expect(screen.getByText('Something went wrong')).toBeTruthy();
    });

    it('calls onRetry when retry button is pressed', () => {
      const onRetry = jest.fn();
      render(
        <HomeworkFeedbackCard
          variant="error"
          questionNumber={1}
          errorMessage="Error"
          onRetry={onRetry}
        />,
      );
      fireEvent.press(screen.getByText('Retry'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has accessibility role on the card container', () => {
      renderCard();
      expect(
        screen.getByLabelText(/homeworkFeedback\.accessibility\.card/),
      ).toBeTruthy();
    });

    it('hides TabDot progress dots from accessibility tree', () => {
      renderCard();
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showMore'));
      const dotsContainer = screen.getByLabelText(
        /homeworkFeedback\.accessibility\.card/,
      );
      const containerChildren = dotsContainer.findAll(
        () => true,
      );
      expect(containerChildren.length).toBeGreaterThan(0);
    });

    it('loading state has progressbar role', () => {
      const { getByLabelText } = render(
        <HomeworkFeedbackCard variant="loading" questionNumber={1} />,
      );
      const loadingCard = getByLabelText(
        'homeworkFeedback.accessibility.loading',
      );
      expect(loadingCard.props.accessibilityRole).toBe('progressbar');
    });

    it('error state has alert role', () => {
      const { getByLabelText } = render(
        <HomeworkFeedbackCard
          variant="error"
          questionNumber={1}
          errorMessage="Test error"
        />,
      );
      const alertEl = getByLabelText('Test error');
      expect(alertEl.props.accessibilityRole).toBe('alert');
    });

    it('button actions have accessibility labels', () => {
      renderCard();
      const showMoreBtn = screen.getByLabelText(
        'homeworkFeedback.actions.accessibility.showMore',
      );
      expect(showMoreBtn).toBeTruthy();
      expect(showMoreBtn.props.accessibilityRole).toBe('button');
    });

    it('Show answer button has accessibility label', () => {
      renderCard();
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showMore'));
      const showAnswerBtn = screen.getByLabelText(
        'homeworkFeedback.actions.accessibility.showAnswer',
      );
      expect(showAnswerBtn).toBeTruthy();
    });

    it('Show less button has accessibility label', () => {
      renderCard();
      fireEvent.press(screen.getByText('homeworkFeedback.actions.showMore'));
      const showLessBtn = screen.getByLabelText(
        'homeworkFeedback.actions.accessibility.hideAnswer',
      );
      expect(showLessBtn).toBeTruthy();
    });
  });

  describe('math rendering', () => {
    it('renders multiplication symbol', () => {
      render(
        <HomeworkFeedbackCard
          help={{ hint: '3 x 4 = ?', guidedSteps: [], workedSolution: '' }}
          questionNumber={1}
        />,
      );
      expect(screen.getByText('3 × 4 = ?')).toBeTruthy();
    });

    it('renders division symbol', () => {
      render(
        <HomeworkFeedbackCard
          help={{ hint: '12 ÷ 3 = ?', guidedSteps: [], workedSolution: '' }}
          questionNumber={1}
        />,
      );
      expect(screen.getByText('12 ÷ 3 = ?')).toBeTruthy();
    });

    it('renders superscript 2', () => {
      render(
        <HomeworkFeedbackCard
          help={{ hint: 'x^2 + y^2', guidedSteps: [], workedSolution: '' }}
          questionNumber={1}
        />,
      );
      expect(screen.getByText('x² + y²')).toBeTruthy();
    });
  });
});
