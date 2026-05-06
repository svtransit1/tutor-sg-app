import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import QuestionSegmentationList from '../QuestionSegmentationList';
import type { SegmentedQuestion } from '../QuestionSegmentationList';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
    ready: true,
  }),
}));

const mockQuestions: SegmentedQuestion[] = [
  {
    id: 'q1',
    number: 1,
    text: 'What is 2 + 2? Show your working.',
    subject: 'math',
    unreadable: false,
  },
  {
    id: 'q2',
    number: 2,
    text: 'Circle the correct spelling: recieve / receive',
    subject: 'english',
    unreadable: false,
  },
  {
    id: 'q3',
    number: 3,
    text: 'Name three states of matter.',
    subject: 'science',
    unreadable: false,
  },
  {
    id: 'q4',
    number: 4,
    text: 'Unclear scribble detected',
    subject: null,
    unreadable: true,
  },
  {
    id: 'q5',
    number: 5,
    text: '这是一道中文题。',
    subject: 'chinese_mt',
    unreadable: false,
  },
];

describe('QuestionSegmentationList', () => {
  it('renders the list with question cards', () => {
    const { getByLabelText } = render(
      <QuestionSegmentationList questions={mockQuestions} />,
    );
    // The FlatList has an accessibilityLabel
    expect(getByLabelText('Homework questions')).toBeTruthy();
  });

  it('renders subject tags for math question', () => {
    const { getByText } = render(
      <QuestionSegmentationList questions={mockQuestions} />,
    );
    expect(getByText('kidHome.subjects.math')).toBeTruthy();
  });

  it('renders subject tags for english question', () => {
    const { getByText } = render(
      <QuestionSegmentationList questions={mockQuestions} />,
    );
    expect(getByText('kidHome.subjects.english')).toBeTruthy();
  });

  it('renders unreadable card', () => {
    const { getByText } = render(
      <QuestionSegmentationList questions={mockQuestions} />,
    );
    // The unreadable card shows the question number
    const unreadableQuestion = getByText('4');
    expect(unreadableQuestion).toBeTruthy();
  });

  it('shows empty state when no questions', () => {
    const { getByText } = render(
      <QuestionSegmentationList questions={[]} />,
    );
    expect(getByText('cameraResult.error.notFound')).toBeTruthy();
  });

  it('calls onQuestionTap when readable card is pressed', () => {
    const onTap = jest.fn();
    const { getByText } = render(
      <QuestionSegmentationList
        questions={[mockQuestions[0]]}
        onQuestionTap={onTap}
      />,
    );
    // Tap the question body text
    fireEvent.press(getByText('What is 2 + 2? Show your working.'));
    expect(onTap).toHaveBeenCalledWith(mockQuestions[0]);
  });

  it('calls onManualInputTap when unreadable card is pressed', () => {
    const onManualTap = jest.fn();
    const { getByText } = render(
      <QuestionSegmentationList
        questions={[mockQuestions[3]]}
        onManualInputTap={onManualTap}
      />,
    );
    // Tap the unreadable card body
    fireEvent.press(getByText('Unclear scribble detected'));
    expect(onManualTap).toHaveBeenCalledWith(mockQuestions[3]);
  });

  it('has accessibility label on the list', () => {
    const { getByLabelText } = render(
      <QuestionSegmentationList questions={mockQuestions} />,
    );
    expect(getByLabelText('Homework questions')).toBeTruthy();
  });

  it('shows Chinese subject for chinese_mt question', () => {
    const { getByText } = render(
      <QuestionSegmentationList questions={mockQuestions} />,
    );
    expect(getByText('kidHome.subjects.chinese')).toBeTruthy();
  });
});
