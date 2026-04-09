import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Water Tracking (ATDD - Story 8.6)', () => {

  test('[P0] should create a water bowl', async ({ request }) => {
    const response = await request.post(`${API_URL}/bowls`, {
      data: { name: 'Water Fountain', bowl_type: 'water', capacity_g: 500, location: 'kitchen' },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.name).toBe('Water Fountain');
    expect(body.bowl_type).toBe('water');
    expect(body.capacity_g).toBe(500);

    // Cleanup
    await request.delete(`${API_URL}/bowls/${body.id}`);
  });

  test('[P0] should log a water refill via POST /bowls/{id}/fill', async ({ request }) => {
    // Create water bowl
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'Water Bowl Test', bowl_type: 'water', capacity_g: 300, location: 'hallway' },
    });
    const bowl = await bowlRes.json();

    // Fill it
    const fillRes = await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { amount_g: 300, served_at: new Date().toISOString(), notes: 'Full refill' },
    });

    expect(fillRes.status()).toBe(201);
    const serving = await fillRes.json();
    expect(serving.bowl_id).toBe(bowl.id);

    // Cleanup
    await request.delete(`${API_URL}/bowls/${bowl.id}`);
  });

  test('[P1] should list water refill history', async ({ request }) => {
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'Water History Bowl', bowl_type: 'water', capacity_g: 400, location: 'bathroom' },
    });
    const bowl = await bowlRes.json();

    // Log 2 refills
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, { data: { amount_g: 400, served_at: new Date().toISOString() } });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, { data: { amount_g: 350, served_at: new Date().toISOString() } });

    const servingsRes = await request.get(`${API_URL}/bowls/${bowl.id}/servings`);
    expect(servingsRes.status()).toBe(200);
    const servings = await servingsRes.json();
    expect(servings.length).toBeGreaterThanOrEqual(2);

    // Cleanup
    await request.delete(`${API_URL}/bowls/${bowl.id}`);
  });
});
