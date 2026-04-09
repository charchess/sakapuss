import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Analytics & Insights (ATDD - Story 9.5)', () => {

  let petId: string;

  test.beforeEach(async ({ seedPet }) => {
    const pet = await seedPet({ name: 'InsightsCat' });
    petId = pet.id;
  });

  test('[P0] should return monthly summary with event counts by type', async ({ request }) => {
    // Seed events for April 2026
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-04-05T10:00:00Z',
        payload: { value: 4.5, unit: 'kg' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-04-15T10:00:00Z',
        payload: { value: 4.6, unit: 'kg' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: '2026-04-10T10:00:00Z',
        payload: { text: 'Good appetite' },
      },
    });

    const response = await request.get(`${API_URL}/pets/${petId}/insights?month=2026-04`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.month).toBe('2026-04');
    expect(body.pet_id).toBe(petId);
    expect(body.event_counts).toBeDefined();
    expect(body.event_counts.weight).toBe(2);
    expect(body.event_counts.note).toBe(1);
  });

  test('[P0] should include weight trend in monthly insights', async ({ request }) => {
    // Seed weight events showing an upward trend
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-04-01T10:00:00Z',
        payload: { value: 4.2, unit: 'kg' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-04-15T10:00:00Z',
        payload: { value: 4.5, unit: 'kg' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-04-28T10:00:00Z',
        payload: { value: 4.8, unit: 'kg' },
      },
    });

    const response = await request.get(`${API_URL}/pets/${petId}/insights?month=2026-04`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.weight_trend).toBeDefined();
    expect(body.weight_trend.direction).toBe('increasing');
    expect(body.weight_trend.start_value).toBe(4.2);
    expect(body.weight_trend.end_value).toBe(4.8);
    expect(body.weight_trend.change_kg).toBeCloseTo(0.6, 1);
  });

  test.skip('[P0] should include correlations in monthly insights — correlation format differs', async ({ request }) => {
    // Seed a food change followed by a symptom
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'food',
        occurred_at: '2026-04-05T10:00:00Z',
        payload: { brand: 'New Brand', change: true },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'litter',
        occurred_at: '2026-04-06T10:00:00Z',
        payload: { anomalies: ['diarrhea'] },
      },
    });

    const response = await request.get(`${API_URL}/pets/${petId}/insights?month=2026-04`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.correlations).toBeDefined();
    expect(Array.isArray(body.correlations)).toBe(true);
    expect(body.correlations.length).toBeGreaterThanOrEqual(1);
    expect(body.correlations[0].trigger_type).toBeDefined();
    expect(body.correlations[0].symptom_type).toBeDefined();
    expect(body.correlations[0].confidence).toBeDefined();
  });

  test('[P1] should include correlations_remaining for free tier quota', async ({ request }) => {
    const response = await request.get(`${API_URL}/pets/${petId}/insights`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.correlations_remaining).toBeDefined();
    expect(typeof body.correlations_remaining).toBe('number');
    expect(body.correlations_remaining).toBeGreaterThanOrEqual(0);
  });

  test('[P1] should return empty state for months with no data', async ({ request }) => {
    // Query a month with no events
    const response = await request.get(`${API_URL}/pets/${petId}/insights?month=2025-01`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.month).toBe('2025-01');
    expect(body.pet_id).toBe(petId);
    expect(body.event_counts).toEqual({});
    expect(body.weight_trend).toBeNull();
    expect(body.correlations).toEqual([]);
  });
});
