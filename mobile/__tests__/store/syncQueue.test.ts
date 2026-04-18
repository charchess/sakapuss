import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncQueue } from '../../src/store/syncQueue';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  // Reset internal listeners
  await SyncQueue.clear();
});

describe('SyncQueue', () => {
  it('getAll returns empty array when nothing stored', async () => {
    const all = await SyncQueue.getAll();
    expect(all).toEqual([]);
  });

  it('enqueue adds event and returns it with localId and synced: false', async () => {
    const item = await SyncQueue.enqueue({
      petId: 'p1',
      type: 'weight',
      payload: { grams: 4200 },
      occurredAt: new Date().toISOString(),
    });
    expect(item.localId).toBeDefined();
    expect(item.synced).toBe(false);
    expect(item.petId).toBe('p1');
    expect(item.type).toBe('weight');
  });

  it('enqueue adds multiple events; getAll returns all of them', async () => {
    await SyncQueue.enqueue({ petId: 'p1', type: 'weight', payload: {}, occurredAt: new Date().toISOString() });
    await SyncQueue.enqueue({ petId: 'p2', type: 'litter_clean', payload: {}, occurredAt: new Date().toISOString() });
    const all = await SyncQueue.getAll();
    expect(all).toHaveLength(2);
  });

  it('getPending returns only unsynced events', async () => {
    const e1 = await SyncQueue.enqueue({ petId: 'p1', type: 'weight', payload: {}, occurredAt: new Date().toISOString() });
    await SyncQueue.enqueue({ petId: 'p2', type: 'litter_clean', payload: {}, occurredAt: new Date().toISOString() });
    await SyncQueue.markSynced(e1.localId);
    const pending = await SyncQueue.getPending();
    expect(pending).toHaveLength(1);
    expect(pending[0].petId).toBe('p2');
  });

  it('getPendingCount returns correct count', async () => {
    await SyncQueue.enqueue({ petId: 'p1', type: 'weight', payload: {}, occurredAt: new Date().toISOString() });
    await SyncQueue.enqueue({ petId: 'p2', type: 'weight', payload: {}, occurredAt: new Date().toISOString() });
    const count = await SyncQueue.getPendingCount();
    expect(count).toBe(2);
  });

  it('markSynced marks the correct event as synced, preserves others', async () => {
    const e1 = await SyncQueue.enqueue({ petId: 'p1', type: 'weight', payload: {}, occurredAt: new Date().toISOString() });
    const e2 = await SyncQueue.enqueue({ petId: 'p2', type: 'weight', payload: {}, occurredAt: new Date().toISOString() });
    await SyncQueue.markSynced(e1.localId);
    const all = await SyncQueue.getAll();
    const first = all.find((e) => e.localId === e1.localId);
    const second = all.find((e) => e.localId === e2.localId);
    expect(first?.synced).toBe(true);
    expect(second?.synced).toBe(false);
  });

  it('markSynced with serverId stores the serverId', async () => {
    const e1 = await SyncQueue.enqueue({ petId: 'p1', type: 'weight', payload: {}, occurredAt: new Date().toISOString() });
    await SyncQueue.markSynced(e1.localId, 'server_abc');
    const all = await SyncQueue.getAll();
    const item = all.find((e) => e.localId === e1.localId);
    expect(item?.serverId).toBe('server_abc');
  });

  it('clearSynced removes synced events but keeps pending ones', async () => {
    const e1 = await SyncQueue.enqueue({ petId: 'p1', type: 'weight', payload: {}, occurredAt: new Date().toISOString() });
    await SyncQueue.enqueue({ petId: 'p2', type: 'litter_clean', payload: {}, occurredAt: new Date().toISOString() });
    await SyncQueue.markSynced(e1.localId);
    await SyncQueue.clearSynced();
    const all = await SyncQueue.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].petId).toBe('p2');
  });

  it('clear empties everything; getAll returns []', async () => {
    await SyncQueue.enqueue({ petId: 'p1', type: 'weight', payload: {}, occurredAt: new Date().toISOString() });
    await SyncQueue.clear();
    const all = await SyncQueue.getAll();
    expect(all).toEqual([]);
  });

  it('subscribe / _notify — subscriber is called after enqueue', async () => {
    const listener = jest.fn();
    const unsub = SyncQueue.subscribe(listener);
    await SyncQueue.enqueue({ petId: 'p1', type: 'weight', payload: {}, occurredAt: new Date().toISOString() });
    expect(listener).toHaveBeenCalledTimes(1);
    unsub();
    await SyncQueue.enqueue({ petId: 'p1', type: 'weight', payload: {}, occurredAt: new Date().toISOString() });
    expect(listener).toHaveBeenCalledTimes(1); // not called again after unsub
  });
});
