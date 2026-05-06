import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';

describe('RNTL smoke test', () => {
  it('renders a View with text', () => {
    render(
      <View>
        <Text testID="hello">Hello!</Text>
      </View>,
    );
    expect(screen.getByTestId('hello')).toBeTruthy();
  });
  it('handles press events', () => {
    const fn = jest.fn();
    render(
      <TouchableOpacity testID="btn" onPress={fn}>
        <Text>Tap</Text>
      </TouchableOpacity>,
    );
    fireEvent.press(screen.getByTestId('btn'));
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('supports jest-native matchers', () => {
    render(
      <View>
        <TouchableOpacity testID="a" onPress={() => {}}>
          <Text>A</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="b" disabled>
          <Text>B</Text>
        </TouchableOpacity>
      </View>,
    );
    expect(screen.getByTestId('a')).toBeEnabled();
    expect(screen.getByTestId('b')).toBeDisabled();
  });
  it('supports toHaveTextContent', () => {
    render(<Text testID="t">Hello World</Text>);
    expect(screen.getByTestId('t')).toHaveTextContent('Hello World');
  });
});
