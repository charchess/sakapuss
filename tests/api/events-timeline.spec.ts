import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Filterable Timeline API (ATDD - Story 2.2)', () => {

  let petId: string;

  test.beforeEach(async ({ request }) => {
    const petRes = await request.post(`${API_URL}/pets`, {
      data: {
        name: 'TimelinePet',
        species: 'Cat',
        birth_date: '2021-06-01',
      },
    });
    expect(petRes.ok()).toBeTruthy();
    const pet = await petRes.json();
    petId = pet.id;

    // Seed 3 events of different types with distinct timestamps
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-01T08:00:00Z',
        payload: { value: 4.0, unit: 'kg' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: '2026-03-04T12:00:00Z',
        payload: { text: 'Appetite normal' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-08T10:00:00Z',
        payload: { value: 4.3, unit: 'kg' },
      },
    });
  });

  test.afterEach(async ({ request }) => {
    if (petId) {
      await request.delete(`${API_URL}/pets/${petId}`);
    }
  });

  test('[P0] should retrieve a sorted timeline for a pet', async ({ request }) => {
    const response = await request.get(`${API_URL}/pets/${petId}/events`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(3);

    // Verify sorting: most recent first (DESC by occurred_at)
    const firstDate = new Date(body[0].occurred_at).getTime();
    const secondDate = new Date(body[1].occurred_at).getTime();
    const thirdDate = new Date(body[2].occurred_at).getTime();
    expect(firstDate).toBeGreaterThan(secondDate);
    expect(secondDate).toBeGreaterThan(thirdDate);
  });

  test('[P1] should filter timeline by event type', async ({ request }) => {
    const response = await request.get(`${API_URL}/pets/${petId}/events?type=weight`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.length).toBe(2);
    expect(body.every((e: any) => e.type === 'weight')).toBe(true);
  });

  test('[P1] should return empty list when filtering by type with no matches', async ({ request }) => {
    const response = await request.get(`${API_URL}/pets/${petId}/events?type=vaccine`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.length).toBe(0);
  });

  test('[P1] should return all events when no type filter is provided', async ({ request }) => {
    const response = await request.get(`${API_URL}/pets/${petId}/events`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.length).toBe(3);
    // Should have both weight and note types
    const types = body.map((e: any) => e.type);
    expect(types).toContain('weight');
    expect(types).toContain('note');
  });

  test('[P2] filtered results should still be sorted DESC', async ({ request }) => {
    const response = await request.get(`${API_URL}/pets/${petId}/events?type=weight`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.length).toBe(2);
    // The March 8 weight should come before March 1 weight
    const firstDate = new Date(body[0].occurred_at).getTime();
    const secondDate = new Date(body[1].occurred_at).getTime();
    expect(firstDate).toBeGreaterThan(secondDate);
  });
});
