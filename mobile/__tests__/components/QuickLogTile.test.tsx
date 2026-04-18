import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickLogTile } from '../../src/components/QuickLogTile';

describe('QuickLogTile', () => {
  it('renders the icon emoji', () => {
    const { getByText } = render(
      <QuickLogTile icon="⚖️" label="Pesée" color="#6C5CE7" onPress={() => {}} />
    );
    expect(getByText('⚖️')).toBeTruthy();
  });

  it('renders the label text', () => {
    const { getByText } = render(
      <QuickLogTile icon="⚖️" label="Pesée" color="#6C5CE7" onPress={() => {}} />
    );
    expect(getByText('Pesée')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <QuickLogTile icon="⚖️" label="Pesée" color="#6C5CE7" onPress={onPress} />
    );
    fireEvent.press(getByText('Pesée'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not crash with empty label', () => {
    expect(() =>
      render(<QuickLogTile icon="⚖️" label="" color="#6C5CE7" onPress={() => {}} />)
    ).not.toThrow();
  });
});
