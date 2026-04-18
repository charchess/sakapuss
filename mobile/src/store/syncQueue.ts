import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'sakapuss_sync_queue';

export interface QueuedEvent {
  localId: string;
  petId: string;
  type: string;
  payload: Record<string, unknown>;
  occurredAt: string;
  synced: boolean;
  serverId?: string;
}

let _listeners: Array<() => void> = [];

export const SyncQueue = {
  subscribe(fn: () => void): () => void {
    _listeners.push(fn);
    return () => {
      _listeners = _listeners.filter((l) => l !== fn);
    };
  },

  _notify() {
    _listeners.forEach((fn) => fn());
  },

  async getAll(): Promise<QueuedEvent[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as QueuedEvent[];
    } catch {
      return [];
    }
  },

  async getPending(): Promise<QueuedEvent[]> {
    const all = await this.getAll();
    return all.filter((e) => !e.synced);
  },

  async getPendingCount(): Promise<number> {
    const pending = await this.getPending();
    return pending.length;
  },

  async enqueue(event: Omit<QueuedEvent, 'localId' | 'synced'>): Promise<QueuedEvent> {
    const item: QueuedEvent = {
      ...event,
      localId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      synced: false,
    };
    const all = await this.getAll();
    all.push(item);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(all));
    this._notify();
    return item;
  },

  async markSynced(localId: string, serverId?: string): Promise<void> {
    const all = await this.getAll();
    const updated = all.map((e) =>
      e.localId === localId ? { ...e, synced: true, serverId } : e
    );
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
    this._notify();
  },

  async clearSynced(): Promise<void> {
    const all = await this.getAll();
    const pending = all.filter((e) => !e.synced);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(pending));
    this._notify();
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
    this._notify();
  },
};
