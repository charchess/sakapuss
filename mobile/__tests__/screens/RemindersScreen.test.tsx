import React from 'react';
import { render } from '@testing-library/react-native';
import { RemindersScreen } from '../../src/screens/RemindersScreen';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8000';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (cb: () => void) => {
      useEffect(cb, []);
    },
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  };
});

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

test('affiche les rappels en retard et à venir', async () => {
  const { findByText } = render(<RemindersScreen />);
  await findByText('Vaccin rage');
  await findByText('Bilan annuel');
  await findByText('En retard');
  await findByText('À venir');
});

test('affiche le badge "1 en retard" dans le header', async () => {
  const { findByText } = render(<RemindersScreen />);
  await findByText('1 en retard');
});

test('état vide quand aucun rappel', async () => {
  server.use(http.get(`${BASE}/reminders/pending`, () => HttpResponse.json([])));
  const { findByText } = render(<RemindersScreen />);
  await findByText('Tout est à jour !');
});

test('affiche le message d\'erreur si API échoue', async () => {
  server.use(http.get(`${BASE}/reminders/pending`, () => HttpResponse.error()));
  const { findByTestId } = render(<RemindersScreen />);
  await findByTestId('error-box');
});
