import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Correlation Engine API (ATDD - Story 5.3)', () => {

  let petId: string;

  test.beforeEach(async ({ seedPet }) => {
    const pet = await seedPet({ name: 'CorrelCat' });
    petId = pet.id;
  });

  test('[P0] should detect food→symptom correlation within 72h', async ({ request }) => {
    // 1. Log a food change event
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'food',
        occurred_at: '2026-03-01T10:00:00Z',
        payload: { brand: 'New Brand', change: true },
      },
    });

    // 2. Log a digestive symptom 24h later
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'litter',
        occurred_at: '2026-03-02T10:00:00Z',
        payload: { anomalies: ['diarrhea'] },
      },
    });

    // 3. Get correlations
    const res = await request.get(`${API_URL}/pets/${petId}/correlations`);
    expect(res.ok()).toBeTruthy();

    const correlations = await res.json();
    expect(correlations.length).toBeGreaterThan(0);

    const foodCorrel = correlations.find((c: any) => c.type === 'food_health');
    expect(foodCorrel).toBeTruthy();
    expect(foodCorrel.trigger_event.type).toBe('food');
    expect(foodCorrel.symptom_event.type).toBe('litter');
  });

  test('[P0] should NOT detect correlation beyond 72h window', async ({ request }) => {
    // Food change
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'food',
        occurred_at: '2026-02-01T10:00:00Z',
        payload: { brand: 'Old Brand', change: true },
      },
    });

    // Symptom 5 days later — outside 72h
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'litter',
        occurred_at: '2026-02-06T10:00:00Z',
        payload: { anomalies: ['diarrhea'] },
      },
    });

    const res = await request.get(`${API_URL}/pets/${petId}/correlations`);
    expect(res.ok()).toBeTruthy();

    const correlations = await res.json();
    expect(correlations.length).toBe(0);
  });

  test('[P1] should return empty array when no correlations exist', async ({ request }) => {
    const res = await request.get(`${API_URL}/pets/${petId}/correlations`);
    expect(res.ok()).toBeTruthy();
    const correlations = await res.json();
    expect(correlations).toEqual([]);
  });
});
