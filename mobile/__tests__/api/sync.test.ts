import { flushQueue, logEvent } from '../../src/api/sync';
import { SyncQueue } from '../../src/store/syncQueue';
import { api } from '../../src/api/client';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../src/store/syncQueue', () => ({
  SyncQueue: {
    enqueue: jest.fn(),
    getPending: jest.fn(),
    getPendingCount: jest.fn(),
    markSynced: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
    getAll: jest.fn(),
    clear: jest.fn(),
    clearSynced: jest.fn(),
    _notify: jest.fn(),
  },
}));

jest.mock('../../src/api/client', () => ({
  api: {
    createPetEvent: jest.fn(),
    getPets: jest.fn(),
    getPetEvents: jest.fn(),
    getAllEvents: jest.fn(),
    getPendingReminders: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  },
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockPending = [
  {
    localId: 'local_1',
    petId: 'pet_1',
    type: 'weight',
    payload: { grams: 4200 },
    occurredAt: '2026-04-18T10:00:00Z',
    synced: false,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true, isInternetReachable: true });
  (SyncQueue.getPending as jest.Mock).mockResolvedValue(mockPending);
  (SyncQueue.getPendingCount as jest.Mock).mockResolvedValue(1);
  (SyncQueue.enqueue as jest.Mock).mockImplementation((event) =>
    Promise.resolve({ ...event, localId: 'local_1', synced: false })
  );
  (SyncQueue.markSynced as jest.Mock).mockResolvedValue(undefined);
  (api.createPetEvent as jest.Mock).mockResolvedValue({
    id: 'server_1',
    pet_id: 'pet_1',
    type: 'weight',
    occurred_at: '2026-04-18T10:00:00Z',
    payload: {},
  });
});

describe('logEvent', () => {
  it('calls SyncQueue.enqueue with correct petId, type, payload, and a recent ISO timestamp', async () => {
    const before = Date.now();
    await logEvent('pet_1', 'weight', { grams: 4200 });
    expect(SyncQueue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        petId: 'pet_1',
        type: 'weight',
        payload: { grams: 4200 },
      })
    );
    const call = (SyncQueue.enqueue as jest.Mock).mock.calls[0][0];
    const ts = new Date(call.occurredAt).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
  });

  it('calls flushQueue after enqueue (fire-and-forget)', async () => {
    // flushQueue will call NetInfo.fetch if it runs
    await logEvent('pet_1', 'weight', { grams: 4200 });
    // Give fire-and-forget time to run
    await new Promise((r) => setTimeout(r, 10));
    expect(NetInfo.fetch).toHaveBeenCalled();
  });
});

describe('flushQueue', () => {
  it('does nothing when NetInfo.fetch returns isConnected: false', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    await flushQueue();
    expect(api.createPetEvent).not.toHaveBeenCalled();
  });

  it('calls api.createPetEvent for each pending event', async () => {
    await flushQueue();
    expect(api.createPetEvent).toHaveBeenCalledWith(
      'pet_1',
      'weight',
      { grams: 4200 },
      '2026-04-18T10:00:00Z'
    );
  });

  it('calls SyncQueue.markSynced with the localId and returned server id after success', async () => {
    await flushQueue();
    expect(SyncQueue.markSynced).toHaveBeenCalledWith('local_1', 'server_1');
  });

  it('does NOT call markSynced when api.createPetEvent throws', async () => {
    (api.createPetEvent as jest.Mock).mockRejectedValue(new Error('network error'));
    await flushQueue();
    expect(SyncQueue.markSynced).not.toHaveBeenCalled();
  });

  it('does not run concurrently (isFlushing guard): second call while first is running is a no-op', async () => {
    // Make createPetEvent resolve via a deferred promise so the first flush hangs after setting isFlushing = true
    let resolveCreate!: (v: unknown) => void;
    const deferredCreate = new Promise((resolve) => { resolveCreate = resolve; });
    (api.createPetEvent as jest.Mock).mockReturnValueOnce(deferredCreate);

    // Start p1 — it will set isFlushing = true, then hang on createPetEvent
    const p1 = flushQueue();

    // Advance past NetInfo.fetch and SyncQueue.getPending so isFlushing = true gets set
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    // Now start p2 — isFlushing should be true, so it returns immediately
    const p2 = flushQueue();
    await p2;

    // Resolve the hanging createPetEvent so p1 finishes
    resolveCreate({ id: 'server_1', pet_id: 'pet_1', type: 'weight', occurred_at: '2026-04-18T10:00:00Z', payload: {} });
    await p1;

    // createPetEvent should only have been called once (p2 was a no-op)
    expect(api.createPetEvent).toHaveBeenCalledTimes(1);
  });
});
