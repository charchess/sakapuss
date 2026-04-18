import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TimelineScreen } from '../../src/screens/TimelineScreen';

jest.mock('../../src/api/client', () => ({
  api: {
    getAllEvents: jest.fn(),
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

jest.mock('../../src/components/SyncBadge', () => ({
  SyncBadge: () => null,
}));

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

import { api } from '../../src/api/client';

const sampleEvents = [
  { id: 'e1', pet_id: 'p1', type: 'weight', occurred_at: '2026-04-18T10:00:00Z', payload: { grams: 4200 } },
  { id: 'e2', pet_id: 'p1', type: 'litter_clean', occurred_at: '2026-04-18T09:00:00Z', payload: {} },
];

describe('TimelineScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.getAllEvents as jest.Mock).mockResolvedValue(sampleEvents);
  });

  it("shows 'Pesée' in the event list after load", async () => {
    const { findByText } = render(<TimelineScreen />);
    expect(await findByText('Pesée')).toBeTruthy();
  });

  it("shows 'Litière nettoyée' in the event list", async () => {
    const { findByText } = render(<TimelineScreen />);
    expect(await findByText('Litière nettoyée')).toBeTruthy();
  });

  it("filter pills are rendered ('Tout', '⚖️ Pesée', etc.)", async () => {
    const { findByText } = render(<TimelineScreen />);
    expect(await findByText('Tout')).toBeTruthy();
    expect(await findByText('⚖️ Pesée')).toBeTruthy();
  });

  it('pressing a filter pill filters the events list', async () => {
    const { findByText, queryByText } = render(<TimelineScreen />);
    // Wait for events to load
    await findByText('Pesée');
    // Press the weight filter pill
    const pill = await findByText('⚖️ Pesée');
    fireEvent.press(pill);
    await waitFor(() => {
      expect(queryByText('Litière nettoyée')).toBeNull();
    });
  });
});
