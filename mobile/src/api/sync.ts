import NetInfo from '@react-native-community/netinfo';
import { SyncQueue, QueuedEvent } from '../store/syncQueue';
import { api } from './client';

let isFlushing = false;

/**
 * Attempts to POST each unsynced event from the queue to the backend.
 * Safe to call at any time — guards against concurrent flushes and offline state.
 */
export async function flushQueue(): Promise<void> {
  if (isFlushing) return;

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  isFlushing = true;

  try {
    const pending = await SyncQueue.getPending();
    if (pending.length === 0) return;

    const results = await Promise.allSettled(
      pending.map((event) => syncEvent(event))
    );

    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.warn(`[sync] Failed to sync event ${pending[i].localId}:`, result.reason);
      }
    });
  } finally {
    isFlushing = false;
  }
}

async function syncEvent(event: QueuedEvent): Promise<void> {
  const created = await api.createPetEvent(
    event.petId,
    event.type,
    event.payload,
    event.occurredAt
  );
  await SyncQueue.markSynced(event.localId, created.id);
}

/**
 * Add an event optimistically to the local queue then attempt to flush.
 */
export async function logEvent(
  petId: string,
  type: string,
  payload: Record<string, unknown>
): Promise<void> {
  await SyncQueue.enqueue({
    petId,
    type,
    payload,
    occurredAt: new Date().toISOString(),
  });

  // Fire and forget — UI reflects queue state immediately
  flushQueue().catch((err) => {
    console.warn('[sync] flushQueue error:', err);
  });
}
