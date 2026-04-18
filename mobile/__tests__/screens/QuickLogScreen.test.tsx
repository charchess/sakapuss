import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { QuickLogScreen } from '../../src/screens/QuickLogScreen';
import * as syncModule from '../../src/api/sync';

jest.mock('../../src/api/sync', () => ({ logEvent: jest.fn(() => Promise.resolve()) }));

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };
const weightRoute = {
  params: {
    type: 'weight',
    label: 'Pesée',
    icon: '⚖️',
    petId: 'pet_1',
    petName: 'Luna',
  },
};
const litterRoute = {
  params: {
    type: 'litter_clean',
    label: 'Litière',
    icon: '🚽',
    petId: 'pet_1',
    petName: 'Luna',
  },
};

beforeEach(() => {
  (syncModule.logEvent as jest.Mock).mockClear();
  mockNavigation.goBack.mockClear();
  mockNavigation.navigate.mockClear();
});

test('renders weight input field for type weight', () => {
  const { getByPlaceholderText } = render(
    <QuickLogScreen navigation={mockNavigation as any} route={weightRoute as any} />
  );
  expect(getByPlaceholderText('ex: 4250')).toBeTruthy();
});

test('weight: validation si poids vide', async () => {
  jest.spyOn(Alert, 'alert');
  const { getByText } = render(
    <QuickLogScreen navigation={mockNavigation as any} route={weightRoute as any} />
  );
  fireEvent.press(getByText('Enregistrer'));
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith(
      'Champ requis',
      expect.stringContaining('valide')
    );
  });
});

test('weight: appelle logEvent avec les bons args', async () => {
  const { getByPlaceholderText, getByText } = render(
    <QuickLogScreen navigation={mockNavigation as any} route={weightRoute as any} />
  );
  fireEvent.changeText(getByPlaceholderText('ex: 4250'), '4200');
  fireEvent.press(getByText('Enregistrer'));
  await waitFor(() =>
    expect(syncModule.logEvent).toHaveBeenCalledWith(
      'pet_1',
      'weight',
      expect.objectContaining({ grams: 4200 })
    )
  );
});

test('weight: goBack après succès', async () => {
  const { getByPlaceholderText, getByText } = render(
    <QuickLogScreen navigation={mockNavigation as any} route={weightRoute as any} />
  );
  fireEvent.changeText(getByPlaceholderText('ex: 4250'), '4200');
  fireEvent.press(getByText('Enregistrer'));
  await waitFor(() => expect(mockNavigation.goBack).toHaveBeenCalledTimes(1));
});

test('litter_clean: bouton confirmer sans champs', async () => {
  const { getByText } = render(
    <QuickLogScreen navigation={mockNavigation as any} route={litterRoute as any} />
  );
  fireEvent.press(getByText('Confirmer'));
  await waitFor(() =>
    expect(syncModule.logEvent).toHaveBeenCalledWith('pet_1', 'litter_clean', {})
  );
});
