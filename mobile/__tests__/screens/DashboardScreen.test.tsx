import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DashboardScreen as DashboardScreenComponent } from '../../src/screens/DashboardScreen';
const DashboardScreen = DashboardScreenComponent as any;
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8000';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (cb: () => void) => {
      useEffect(cb, []);
    },
    useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  };
});

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

jest.mock('../../src/api/sync', () => ({
  flushQueue: jest.fn(),
  logEvent: jest.fn(),
}));

beforeEach(() => {
  mockNavigate.mockClear();
});

test('affiche les animaux et les événements récents', async () => {
  const { findAllByText } = render(<DashboardScreen navigation={{ navigate: mockNavigate }} />);
  const lunas = await findAllByText('Luna');
  expect(lunas.length).toBeGreaterThan(0);
  const milos = await findAllByText('Milo');
  expect(milos.length).toBeGreaterThan(0);
});

test('affiche le bandeau de rappels quand il y en a', async () => {
  const { findByText } = render(<DashboardScreen navigation={{ navigate: mockNavigate }} />);
  await findByText(/rappel/i);
});

test('les tuiles de saisie rapide sont présentes', async () => {
  const { findAllByText, findByText } = render(<DashboardScreen navigation={{ navigate: mockNavigate }} />);
  await findByText('Litière');
  await findByText('Gamelle');
  const pesees = await findAllByText('Pesée');
  expect(pesees.length).toBeGreaterThan(0);
  await findByText('Médicament');
  await findByText('Observation');
  await findByText('Événement');
});

test('appuyer sur une tuile navigue vers QuickLog', async () => {
  const { findAllByText } = render(<DashboardScreen navigation={{ navigate: mockNavigate }} />);
  const pesees = await findAllByText('Pesée');
  fireEvent.press(pesees[0]);
  expect(mockNavigate).toHaveBeenCalledWith('QuickLog', expect.objectContaining({ type: 'weight' }));
});

test('affiche état vide si aucun événement récent', async () => {
  server.use(
    http.get(`${BASE}/pets/p1/events`, () => HttpResponse.json([])),
    http.get(`${BASE}/pets/p2/events`, () => HttpResponse.json([]))
  );
  const { findByText } = render(<DashboardScreen navigation={{ navigate: mockNavigate }} />);
  await findByText('Aucun événement récent');
});

test('affiche le message d\'erreur si API échoue', async () => {
  server.use(http.get(`${BASE}/pets`, () => HttpResponse.error()));
  const { findByTestId } = render(<DashboardScreen navigation={{ navigate: mockNavigate }} />);
  await findByTestId('error-box');
});

test('aucun rappel = pas de bandeau', async () => {
  server.use(http.get(`${BASE}/reminders/pending`, () => HttpResponse.json([])));
  const { findAllByText, queryByText } = render(<DashboardScreen navigation={{ navigate: mockNavigate }} />);
  await findAllByText('Luna');
  expect(queryByText(/rappels? en attente/i)).toBeNull();
});
