import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Consumption Estimate (ATDD - Story 7.3)', () => {

  test('[P0] should return zero estimate for stocked bag', async ({ request }) => {
    // Create product + bag
    const prodRes = await request.post(`${API_URL}/food/products`, {
      data: { name: 'EstProd', brand: 'Brand', food_type: 'kibble', food_category: 'main' },
    });
    const product = await prodRes.json();

    const bagRes = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: product.id, weight_g: 7000, purchased_at: '2026-03-01' },
    });
    const bag = await bagRes.json();

    const res = await request.get(`${API_URL}/food/bags/${bag.id}/estimate`);
    expect(res.ok()).toBeTruthy();
    const estimate = await res.json();
    expect(estimate.daily_consumption_g).toBe(0);
    expect(estimate.remaining_g).toBe(7000);
    expect(estimate.estimated_depletion_date).toBeNull();
    expect(estimate.alert).toBe(false);
  });

  test('[P0] should estimate consumption for opened bag with servings', async ({ request }) => {
    // Create product
    const prodRes = await request.post(`${API_URL}/food/products`, {
      data: { name: 'EstProd2', brand: 'Brand2', food_type: 'kibble', food_category: 'main' },
    });
    const product = await prodRes.json();

    // Create bag and open it
    const bagRes = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: product.id, weight_g: 7000, purchased_at: '2026-03-01' },
    });
    const bag = await bagRes.json();
    await request.post(`${API_URL}/food/bags/${bag.id}/open`);

    // Create bowl and log servings linked to the bag
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'EstBowl', location: 'Salon', bowl_type: 'food' },
    });
    const bowl = await bowlRes.json();

    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-09T08:00:00', amount_g: 50 },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-09T18:00:00', amount_g: 50 },
    });

    const res = await request.get(`${API_URL}/food/bags/${bag.id}/estimate`);
    expect(res.ok()).toBeTruthy();
    const estimate = await res.json();
    expect(estimate.daily_consumption_g).toBeGreaterThan(0);
    expect(estimate.remaining_g).toBeLessThan(7000);
    expect(estimate.remaining_g).toBe(6900);
    expect(estimate.days_remaining).toBeGreaterThan(0);
    expect(estimate.estimated_depletion_date).toBeTruthy();
  });
});
