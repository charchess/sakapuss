import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { TimelineScreen } from '../../src/screens/TimelineScreen';
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

jest.mock('../../src/components/SyncBadge', () => ({
  SyncBadge: () => null,
}));

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

test('affiche les événements après chargement', async () => {
  const { findByText } = render(<TimelineScreen />);
  await findByText('Pesée');
  await findByText('Litière nettoyée');
});

test('le filtre Pesée masque Litière nettoyée', async () => {
  const { findByText, queryByText, getByText } = render(<TimelineScreen />);
  await findByText('Pesée');
  fireEvent.press(getByText('⚖️ Pesée'));
  await waitFor(() => {
    expect(queryByText('Litière nettoyée')).toBeNull();
  });
});

test('affiche error-box si API échoue', async () => {
  server.use(http.get(`${BASE}/events`, () => HttpResponse.error()));
  const { findByTestId } = render(<TimelineScreen />);
  await findByTestId('error-box');
});
