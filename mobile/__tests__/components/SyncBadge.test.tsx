import React from 'react';
import { render } from '@testing-library/react-native';
import { SyncBadge } from '../../src/components/SyncBadge';

jest.mock('../../src/store/syncQueue', () => ({
  SyncQueue: {
    getPendingCount: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

import { SyncQueue } from '../../src/store/syncQueue';

describe('SyncBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null (renders nothing) when count is 0', async () => {
    (SyncQueue.getPendingCount as jest.Mock).mockResolvedValue(0);
    const { toJSON } = render(<SyncBadge />);
    // Give the async call time to complete
    await new Promise((r) => setTimeout(r, 20));
    expect(toJSON()).toBeNull();
  });

  it('renders count text when count > 0', async () => {
    (SyncQueue.getPendingCount as jest.Mock).mockResolvedValue(3);
    const { findByText } = render(<SyncBadge />);
    const text = await findByText('3 en attente de sync');
    expect(text).toBeTruthy();
  });
});
