import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Weight Trend Calculation (ATDD - Story 5.3)', () => {

  let petId: string;

  test.afterEach(async ({ request }) => {
    if (petId) {
      await request.delete(`${API_URL}/pets/${petId}`);
      petId = '';
    }
  });

  test.skip('[P0] should calculate trend as "stable" when weight change < 2% over 2 weeks', async ({ request, seedPet }) => {
    const pet = await seedPet({ name: 'StableCat' });
    petId = pet.id;

    // Seed weight events over 2+ weeks with <2% change (4.0 -> 4.05 = 1.25%)
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-20T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-27T10:00:00Z', payload: { value: 4.02, unit: 'kg' } },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-04-03T10:00:00Z', payload: { value: 4.05, unit: 'kg' } },
    });

    const res = await request.get(`${API_URL}/pets/${petId}/weight/summary`);
    expect(res.ok()).toBeTruthy();
    const summary = await res.json();
    expect(summary.trend_direction).toBe('stable');
  });

  test.skip('[P0] should calculate trend as "declining" when weight drops > 2% over 2 weeks', async ({ request, seedPet }) => {
    const pet = await seedPet({ name: 'DecliningCat' });
    petId = pet.id;

    // Seed weight events: 4.0 -> 3.85 = -3.75% decline
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-20T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-27T10:00:00Z', payload: { value: 3.92, unit: 'kg' } },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-04-03T10:00:00Z', payload: { value: 3.85, unit: 'kg' } },
    });

    const res = await request.get(`${API_URL}/pets/${petId}/weight/summary`);
    expect(res.ok()).toBeTruthy();
    const summary = await res.json();
    expect(summary.trend_direction).toBe('declining');
  });

  test.skip('[P0] should calculate trend as "gaining" when weight increases > 2% over 2 weeks', async ({ request, seedPet }) => {
    const pet = await seedPet({ name: 'GainingCat' });
    petId = pet.id;

    // Seed weight events: 4.0 -> 4.15 = +3.75% gain
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-20T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-27T10:00:00Z', payload: { value: 4.08, unit: 'kg' } },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-04-03T10:00:00Z', payload: { value: 4.15, unit: 'kg' } },
    });

    const res = await request.get(`${API_URL}/pets/${petId}/weight/summary`);
    expect(res.ok()).toBeTruthy();
    const summary = await res.json();
    expect(summary.trend_direction).toBe('gaining');
  });

  test.skip('[P1] should return trend data in GET /pets/{petId}/weight/summary (current_weight, trend_direction, change_amount, change_period)', async ({ request, seedPet }) => {
    const pet = await seedPet({ name: 'SummaryCat' });
    petId = pet.id;

    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-20T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-27T10:00:00Z', payload: { value: 4.1, unit: 'kg' } },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-04-03T10:00:00Z', payload: { value: 4.2, unit: 'kg' } },
    });

    const res = await request.get(`${API_URL}/pets/${petId}/weight/summary`);
    expect(res.ok()).toBeTruthy();
    const summary = await res.json();

    // Verify all expected fields are present
    expect(summary.current_weight).toBe(4.2);
    expect(summary.trend_direction).toBeDefined();
    expect(typeof summary.trend_direction).toBe('string');
    expect(summary.change_amount).toBeDefined();
    expect(typeof summary.change_amount).toBe('number');
    expect(summary.change_period).toBeDefined();
    expect(summary.change_period).toMatch(/\d+ days/);
  });

  test.skip('[P1] should return "insufficient_data" when fewer than 3 weight entries', async ({ request, seedPet }) => {
    const pet = await seedPet({ name: 'SparseDataCat' });
    petId = pet.id;

    // Only 2 weight entries - not enough for trend
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-20T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-04-03T10:00:00Z', payload: { value: 4.2, unit: 'kg' } },
    });

    const res = await request.get(`${API_URL}/pets/${petId}/weight/summary`);
    expect(res.ok()).toBeTruthy();
    const summary = await res.json();
    expect(summary.trend_direction).toBe('insufficient_data');
    expect(summary.current_weight).toBe(4.2);
  });
});
