import React from 'react';
import { render } from '@testing-library/react-native';
import CameraResultScreen from '../CameraResultScreen';
import type { HomeworkFeedbackResult, Subject } from '../../../models/homework-feedback';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));

const mockResult: HomeworkFeedbackResult = {
  sessionId: 'test-1', questions: [{ questionNumber: 1, subject: 'math' as Subject, topic: 'Fractions', questionText: 'What is 1/2 + 1/3?' }],
};

describe('CameraResultScreen', () => {
  it('renders title', () => expect(render(<CameraResultScreen feedbackResult={mockResult} />).getByText('cameraResult.title')).toBeTruthy());
  it('renders back button', () => expect(render(<CameraResultScreen feedbackResult={mockResult} />).getByLabelText('common.back')).toBeTruthy());
  it('renders question header', () => expect(render(<CameraResultScreen feedbackResult={mockResult} />).getByText('cameraResult.question')).toBeTruthy());
  it('renders subject badge', () => expect(render(<CameraResultScreen feedbackResult={mockResult} />).getByText('Math')).toBeTruthy());
  it('renders topic label', () => expect(render(<CameraResultScreen feedbackResult={mockResult} />).getByText('Fractions')).toBeTruthy());
  it('renders question text', () => expect(render(<CameraResultScreen feedbackResult={mockResult} />).getByText('What is 1/2 + 1/3?')).toBeTruthy());
  it('renders question label', () => expect(render(<CameraResultScreen feedbackResult={mockResult} />).getByText('cameraResult.questionLabel')).toBeTruthy());
  it('renders default mock data', () => {
    const { getByText, getAllByText } = render(<CameraResultScreen />);
    expect(getByText('cameraResult.title')).toBeTruthy();
    expect(getAllByText('Math').length).toBe(2);
  });
});
