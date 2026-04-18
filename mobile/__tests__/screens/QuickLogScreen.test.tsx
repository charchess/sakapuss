import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { QuickLogScreen } from '../../src/screens/QuickLogScreen';

jest.mock('../../src/api/sync', () => ({ logEvent: jest.fn(() => Promise.resolve()) }));

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

import { logEvent } from '../../src/api/sync';

const mockGoBack = jest.fn();
const navigation = { goBack: mockGoBack };
const weightRoute = {
  params: {
    type: 'weight',
    label: 'Pesée',
    icon: '⚖️',
    petId: 'pet_1',
    petName: 'Luna',
  },
};

describe('QuickLogScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders weight input field for type weight', () => {
    const { getByPlaceholderText } = render(
      <QuickLogScreen navigation={navigation} route={weightRoute} />
    );
    expect(getByPlaceholderText('ex: 4250')).toBeTruthy();
  });

  it('shows validation error when submitting with empty weight', async () => {
    jest.spyOn(Alert, 'alert');
    const { getByText } = render(
      <QuickLogScreen navigation={navigation} route={weightRoute} />
    );
    fireEvent.press(getByText('Enregistrer'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Champ requis',
        expect.stringContaining('valide')
      );
    });
  });

  it('calls logEvent with correct petId, type, payload on valid submit', async () => {
    const { getByPlaceholderText, getByText } = render(
      <QuickLogScreen navigation={navigation} route={weightRoute} />
    );
    fireEvent.changeText(getByPlaceholderText('ex: 4250'), '4200');
    fireEvent.press(getByText('Enregistrer'));
    await waitFor(() => {
      expect(logEvent).toHaveBeenCalledWith(
        'pet_1',
        'weight',
        expect.objectContaining({ grams: 4200 })
      );
    });
  });

  it('navigates back after successful log', async () => {
    const { getByPlaceholderText, getByText } = render(
      <QuickLogScreen navigation={navigation} route={weightRoute} />
    );
    fireEvent.changeText(getByPlaceholderText('ex: 4250'), '4200');
    fireEvent.press(getByText('Enregistrer'));
    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });
});
