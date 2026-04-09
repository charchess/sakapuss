import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Polymorphic Events System (ATDD - Story 2.1)', () => {

  let petId: string;

  test.beforeEach(async ({ request }) => {
    // Create a pet to attach events to
    const petRes = await request.post(`${API_URL}/pets`, {
      data: {
        name: 'TestPet',
        species: 'Cat',
        birth_date: '2020-01-15',
      },
    });
    expect(petRes.ok()).toBeTruthy();
    const pet = await petRes.json();
    petId = pet.id;
  });

  test.afterEach(async ({ request }) => {
    // Cleanup: delete the pet (cascading should delete events)
    if (petId) {
      await request.delete(`${API_URL}/pets/${petId}`);
    }
  });

  test('[P0] should create a weight event with JSON payload', async ({ request }) => {
    const response = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-08T10:00:00Z',
        payload: { value: 4.5, unit: 'kg' },
      },
    });

    expect(response.status()).toBe(201);
    const event = await response.json();
    expect(event.id).toBeTruthy();
    expect(event.pet_id).toBe(petId);
    expect(event.type).toBe('weight');
    expect(event.payload).toEqual({ value: 4.5, unit: 'kg' });
    expect(event.occurred_at).toBeTruthy();
    expect(event.created_at).toBeTruthy();
  });

  test('[P0] should create a note event with text payload', async ({ request }) => {
    const response = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: '2026-03-08T11:00:00Z',
        payload: { text: 'Seems more tired than usual today' },
      },
    });

    expect(response.status()).toBe(201);
    const event = await response.json();
    expect(event.type).toBe('note');
    expect(event.payload).toEqual({ text: 'Seems more tired than usual today' });
  });

  test('[P0] should create a vaccine event with next_due date', async ({ request }) => {
    const response = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: '2026-03-08T09:00:00Z',
        payload: { name: 'Rabies', next_due: '2027-03-08' },
      },
    });

    expect(response.status()).toBe(201);
    const event = await response.json();
    expect(event.type).toBe('vaccine');
    expect(event.payload.name).toBe('Rabies');
    expect(event.payload.next_due).toBe('2027-03-08');
  });

  test('[P0] should list events for a pet ordered by occurred_at DESC', async ({ request }) => {
    // Create events with different timestamps
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-01T10:00:00Z',
        payload: { value: 4.2, unit: 'kg' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: '2026-03-05T10:00:00Z',
        payload: { text: 'Good appetite' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-08T10:00:00Z',
        payload: { value: 4.5, unit: 'kg' },
      },
    });

    const response = await request.get(`${API_URL}/pets/${petId}/events`);
    expect(response.ok()).toBeTruthy();
    const events = await response.json();

    expect(events.length).toBe(3);
    // Should be sorted DESC by occurred_at
    expect(new Date(events[0].occurred_at).getTime()).toBeGreaterThan(
      new Date(events[1].occurred_at).getTime()
    );
    expect(new Date(events[1].occurred_at).getTime()).toBeGreaterThan(
      new Date(events[2].occurred_at).getTime()
    );
  });

  test('[P1] should reject invalid event type', async ({ request }) => {
    const response = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'invalid_type',
        occurred_at: '2026-03-08T10:00:00Z',
        payload: { foo: 'bar' },
      },
    });

    expect(response.status()).toBe(422);
  });

  test('[P1] should return 404 when creating event for non-existent pet', async ({ request }) => {
    const response = await request.post(`${API_URL}/pets/non-existent-id/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-08T10:00:00Z',
        payload: { value: 4.5, unit: 'kg' },
      },
    });

    expect(response.status()).toBe(404);
  });

  test('[P1] should get a single event by ID', async ({ request }) => {
    // Create an event first
    const createRes = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-08T10:00:00Z',
        payload: { value: 4.5, unit: 'kg' },
      },
    });
    const created = await createRes.json();

    const response = await request.get(`${API_URL}/events/${created.id}`);
    expect(response.ok()).toBeTruthy();
    const event = await response.json();
    expect(event.id).toBe(created.id);
    expect(event.type).toBe('weight');
  });

  test('[P1] should update an event', async ({ request }) => {
    // Create an event
    const createRes = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-08T10:00:00Z',
        payload: { value: 4.5, unit: 'kg' },
      },
    });
    const created = await createRes.json();

    // Update the payload
    const updateRes = await request.put(`${API_URL}/events/${created.id}`, {
      data: {
        payload: { value: 4.8, unit: 'kg' },
      },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updated = await updateRes.json();
    expect(updated.payload).toEqual({ value: 4.8, unit: 'kg' });
  });

  test('[P1] should delete an event', async ({ request }) => {
    // Create an event
    const createRes = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: '2026-03-08T10:00:00Z',
        payload: { text: 'To be deleted' },
      },
    });
    const created = await createRes.json();

    // Delete it
    const deleteRes = await request.delete(`${API_URL}/events/${created.id}`);
    expect(deleteRes.status()).toBe(204);

    // Verify it's gone
    const getRes = await request.get(`${API_URL}/events/${created.id}`);
    expect(getRes.status()).toBe(404);
  });

  test('[P2] should cascade delete events when pet is deleted', async ({ request }) => {
    // Create an event
    const createRes = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-08T10:00:00Z',
        payload: { value: 4.5, unit: 'kg' },
      },
    });
    const created = await createRes.json();

    // Delete the pet
    await request.delete(`${API_URL}/pets/${petId}`);

    // Event should be gone too
    const getRes = await request.get(`${API_URL}/events/${created.id}`);
    expect(getRes.status()).toBe(404);

    // Prevent afterEach from trying to delete already-deleted pet
    petId = '';
  });
});
