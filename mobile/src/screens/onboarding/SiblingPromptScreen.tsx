import React from 'react';
import { View, Text } from 'react-native';

interface SiblingPromptScreenProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function SiblingPromptScreen(_props: SiblingPromptScreenProps) {
  return (
    <View>
      <Text>Sibling Prompt (placeholder)</Text>
    </View>
  );
}
