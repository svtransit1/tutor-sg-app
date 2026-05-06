/**
 * Tutor Chat Route — full-screen tutor chat with AI.
 *
 * Wraps TutorChatScreen for Expo Router navigation.
 * Accessible from the kid home screen.
 */

import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import TutorChatScreen from '../../src/screens/TutorChatScreen';
import type { ChatMessage } from '../../src/screens/TutorChatScreen';

export default function TutorChatRoute() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSendMessage = useCallback(
    async (text: string): Promise<ChatMessage> => {
      // Mock: Simulate LLM processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const lower = text.toLowerCase();

      // Math questions → structured scaffolded help
      if (lower.includes('math') || lower.includes('add') || lower.includes('plus') || lower.includes('number') || lower.includes('乘') || lower.includes('加') || lower.includes('数')) {
        return {
          id: 'mock',
          role: 'assistant',
          text: "Let's work on this math problem together! First, let's identify what the question is asking.",
          streaming: false,
          scaffoldedHelp: {
            hint: 'Read the question carefully. What information are we given, and what do we need to find?',
            steps: [
              { step: 1, description: 'Read the question carefully and identify the key numbers.', working: 'e.g. 5 apples, 3 more apples' },
              { step: 2, description: 'Decide which operation to use (addition, subtraction, etc.).', working: 'Combining groups → addition' },
              { step: 3, description: 'Solve step by step and check your answer.', working: '5 + 3 = 8' },
            ],
            fullSolution: 'The answer is 8. When we add 3 to 5, we get 8. Always double-check by counting!',
          },
        };
      }

      // English questions
      if (lower.includes('english') || lower.includes('grammar') || lower.includes('word') || lower.includes('spell')) {
        return {
          id: 'mock',
          role: 'assistant',
          text: "That's a great English question! Let's break it down together.",
          streaming: false,
          scaffoldedHelp: {
            hint: 'Think about the rules we know about sentences and words. What sounds right to you?',
            steps: [
              { step: 1, description: 'Read the sentence out loud. Does it sound correct?', working: 'Listen for what feels natural' },
              { step: 2, description: 'Look at the grammar rule involved.', working: 'Subject-verb agreement, tense, or word order' },
              { step: 3, description: 'Check your answer by re-reading the whole sentence.', working: 'Does it make sense in context?' },
            ],
            fullSolution: 'Apply the grammar rule you just learned and see which option fits!',
          },
        };
      }

      // General response
      return {
        id: 'mock',
        role: 'assistant',
        text: "That's a great question! Let me think about this... I'd suggest starting by identifying the key pieces of information. What do you think is the most important thing to focus on here? Try breaking it down into smaller steps — that usually helps!",
        streaming: false,
      };
    },
    [],
  );

  return (
    <TutorChatScreen
      initialMessages={[]}
      onSendMessage={handleSendMessage}
      onBack={handleBack}
    />
  );
}
