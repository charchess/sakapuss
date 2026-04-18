import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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

test('affiche les boutons ✅ Fait et ⏭️ +7j', async () => {
  const { findAllByText } = render(<RemindersScreen />);
  const doneButtons = await findAllByText('✅ Fait');
  const postponeButtons = await findAllByText('⏭️ +7j');
  expect(doneButtons.length).toBeGreaterThan(0);
  expect(postponeButtons.length).toBeGreaterThan(0);
});

test('appuyer sur ✅ Fait déclenche l\'API completeReminder', async () => {
  let completeCalled = false;
  // Only override the complete endpoint — let the default pending handler return r1+r2
  server.use(
    http.post(`${BASE}/reminders/r1/complete`, () => {
      completeCalled = true;
      return HttpResponse.json({ id: 'r1', pet_id: 'p1', pet_name: 'Luna', name: 'Vaccin rage', type: 'vaccine', next_due_date: '2020-01-01', status: 'done' });
    })
  );
  const { findAllByText } = render(<RemindersScreen />);
  // r1 is overdue → sorted first; r2 is upcoming → sorted last
  const doneButtons = await findAllByText('✅ Fait');
  fireEvent.press(doneButtons[0]); // presses r1's button
  await waitFor(() => {
    expect(completeCalled).toBe(true);
  });
});

test('appuyer sur ⏭️ +7j déclenche l\'API postponeReminder', async () => {
  let postponePayload: unknown = null;
  server.use(
    http.post(`${BASE}/reminders/r1/postpone`, async ({ request }) => {
      postponePayload = await request.json();
      return HttpResponse.json({ id: 'r1', pet_id: 'p1', pet_name: 'Luna', name: 'Vaccin rage', type: 'vaccine', next_due_date: '2020-01-08', status: 'overdue' });
    })
  );
  const { findAllByText } = render(<RemindersScreen />);
  const postponeButtons = await findAllByText('⏭️ +7j');
  fireEvent.press(postponeButtons[0]);
  await waitFor(() => {
    expect(postponePayload).toEqual({ delay_days: 7 });
  });
});
