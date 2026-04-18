import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { RemindersScreen } from '../../src/screens/RemindersScreen';

jest.mock('../../src/api/client', () => ({
  api: {
    getPendingReminders: jest.fn(),
  },
  apiClient: {
    get: jest.fn(),
  },
}));

jest.mock('../../src/store/auth', () => ({
  AuthStore: {
    getToken: jest.fn(() => Promise.resolve('test-token')),
    getBaseUrl: jest.fn(() => Promise.resolve('http://localhost:8000')),
  },
}));

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

import { api } from '../../src/api/client';

const sampleReminders = [
  { id: 'r1', pet_id: 'p1', pet_name: 'Luna', name: 'Vaccin rage', type: 'vaccine', next_due_date: '2020-01-01', status: 'overdue' },
  { id: 'r2', pet_id: 'p1', pet_name: 'Luna', name: 'Bilan annuel', type: 'vet', next_due_date: '2099-12-31', status: 'upcoming' },
];

describe('RemindersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows 'En retard' badge for overdue reminder", async () => {
    (api.getPendingReminders as jest.Mock).mockResolvedValue(sampleReminders);
    const { findByText } = render(<RemindersScreen />);
    expect(await findByText('En retard')).toBeTruthy();
  });

  it("shows 'À venir' for future reminder", async () => {
    (api.getPendingReminders as jest.Mock).mockResolvedValue(sampleReminders);
    const { findByText } = render(<RemindersScreen />);
    expect(await findByText('À venir')).toBeTruthy();
  });

  it("shows overdueCount badge in header when there are overdue reminders", async () => {
    (api.getPendingReminders as jest.Mock).mockResolvedValue(sampleReminders);
    const { findByText } = render(<RemindersScreen />);
    expect(await findByText('1 en retard')).toBeTruthy();
  });

  it('shows empty state when reminders list is empty', async () => {
    (api.getPendingReminders as jest.Mock).mockResolvedValue([]);
    const { findByText } = render(<RemindersScreen />);
    expect(await findByText('Tout est à jour !')).toBeTruthy();
  });
});
