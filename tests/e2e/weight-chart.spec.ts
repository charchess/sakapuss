import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Weight Chart Visualization (ATDD - Story 2.4)', () => {

  let petId: string;

  test.afterEach(async ({ request, authHeaders }) => {
    if (petId) {
      await request.delete(`${API_URL}/pets/${petId}`, { headers: authHeaders });
      petId = '';
    }
  });

  test('[P0] should display weight chart when pet has weight data', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: 'ChartCat' });
    petId = pet.id;

    // Seed multiple weight events over time
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-01-15T10:00:00Z', payload: { value: 3.8, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-02-15T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-08T10:00:00Z', payload: { value: 4.3, unit: 'kg' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${petId}`);

    const chart = page.getByTestId('weight-chart');
    await expect(chart).toBeVisible();

    // Should render an SVG element
    const svg = chart.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('[P0] should show weight values on the chart', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: 'WeightCat' });
    petId = pet.id;

    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-01-15T10:00:00Z', payload: { value: 3.5, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-08T10:00:00Z', payload: { value: 4.2, unit: 'kg' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${petId}`);

    const chart = page.getByTestId('weight-chart');
    await expect(chart).toBeVisible();

    // Should show weight values as labels
    await expect(chart).toContainText('3.5');
    await expect(chart).toContainText('4.2');
  });

  test('[P1] should show insufficient data message with fewer than 2 weight events', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: 'LonelyCat' });
    petId = pet.id;

    // Only 1 weight event
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-08T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${petId}`);

    const noData = page.getByTestId('weight-chart-insufficient');
    await expect(noData).toBeVisible();
  });

  test('[P1] should not show weight chart when pet has no weight events', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: 'NoteCat' });
    petId = pet.id;

    // Only note events, no weight
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: { type: 'note', occurred_at: '2026-03-08T10:00:00Z', payload: { text: 'Just a note' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${petId}`);

    const chart = page.getByTestId('weight-chart');
    await expect(chart).not.toBeVisible();
  });
});
