import React from 'react';
import { render } from '@testing-library/react-native';
import { PetProfileScreen } from '../../src/screens/PetProfileScreen';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8000';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
    useFocusEffect: (cb: () => void) => { useEffect(cb, []); },
  };
});

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

const defaultRoute = {
  params: { petId: 'p1', petName: 'Luna', species: 'cat', breed: 'Européen', birthDate: '2020-03-15' },
};

beforeEach(() => {
  mockNavigate.mockClear();
  mockGoBack.mockClear();
});

test('affiche le nom et l\'espèce de l\'animal', async () => {
  const { findByText, findAllByText } = render(
    <PetProfileScreen route={defaultRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />
  );
  const lunas = await findAllByText('Luna');
  expect(lunas.length).toBeGreaterThan(0);
  await findByText('🐱');
});

test('affiche la race quand elle est fournie', async () => {
  const { findByText } = render(
    <PetProfileScreen route={defaultRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />
  );
  await findByText('Européen');
});

test('calcule et affiche l\'âge à partir de birth_date', async () => {
  const { findByText } = render(
    <PetProfileScreen route={defaultRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />
  );
  // 2020-03-15 → ~5 ans in 2026
  await findByText(/\d+ an/);
});

test('affiche les événements récents de l\'animal', async () => {
  const { findByText } = render(
    <PetProfileScreen route={defaultRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />
  );
  await findByText(/pesée|poids/i);
});

test('état vide si aucun événement', async () => {
  server.use(http.get(`${BASE}/pets/p1/events`, () => HttpResponse.json([])));
  const { findByText } = render(
    <PetProfileScreen route={defaultRoute as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />
  );
  await findByText(/aucun événement/i);
});

test('n\'affiche pas de race si non fournie', async () => {
  const routeNoBirthNoBread = {
    params: { petId: 'p1', petName: 'Luna', species: 'cat', breed: undefined, birthDate: undefined },
  };
  const { queryByText, findAllByText } = render(
    <PetProfileScreen route={routeNoBirthNoBread as any} navigation={{ navigate: mockNavigate, goBack: mockGoBack } as any} />
  );
  await findAllByText('Luna');
  expect(queryByText('Européen')).toBeNull();
});
