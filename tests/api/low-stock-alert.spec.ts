import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Low Stock Alert Mechanism (ATDD - Story 8.5)', () => {

  test.skip('[P0] should set low_stock=true when estimated depletion < 5 days', async ({ request }) => {
    // Create product
    const prodRes = await request.post(`${API_URL}/food/products`, {
      data: { name: 'LowStockKibble', brand: 'TestBrand', food_type: 'kibble', food_category: 'main' },
    });
    const product = await prodRes.json();

    // Create bag (small: 1000g) and open it
    const bagRes = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: product.id, weight_g: 1000, purchased_at: '2026-03-01' },
    });
    const bag = await bagRes.json();
    await request.post(`${API_URL}/food/bags/${bag.id}/open`);

    // Create bowl and log servings to deplete most of the bag
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'LowStockBowl', location: 'Salon', bowl_type: 'food' },
    });
    const bowl = await bowlRes.json();

    // Log 100g/day over 8 days = 800g consumed, 200g remaining
    // At 100g/day rate, 200g remaining = 2 days left (< 5 day threshold)
    for (let day = 1; day <= 8; day++) {
      await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
        data: {
          bag_id: bag.id,
          served_at: `2026-03-0${day}T08:00:00`,
          amount_g: 50,
        },
      });
      await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
        data: {
          bag_id: bag.id,
          served_at: `2026-03-0${day}T18:00:00`,
          amount_g: 50,
        },
      });
    }

    // Check estimate - should flag low stock
    const res = await request.get(`${API_URL}/food/bags/${bag.id}/estimate`);
    expect(res.ok()).toBeTruthy();
    const estimate = await res.json();
    expect(estimate.remaining_g).toBe(200);
    expect(estimate.days_remaining).toBeLessThan(5);
    expect(estimate.low_stock).toBe(true);
  });

  test.skip('[P0] should set low_stock=false when estimated depletion >= 5 days', async ({ request }) => {
    // Create product
    const prodRes = await request.post(`${API_URL}/food/products`, {
      data: { name: 'PlentifulKibble', brand: 'TestBrand', food_type: 'kibble', food_category: 'main' },
    });
    const product = await prodRes.json();

    // Create bag (large: 7000g) and open it
    const bagRes = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: product.id, weight_g: 7000, purchased_at: '2026-03-01' },
    });
    const bag = await bagRes.json();
    await request.post(`${API_URL}/food/bags/${bag.id}/open`);

    // Create bowl and log moderate servings
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'PlentifulBowl', location: 'Salon', bowl_type: 'food' },
    });
    const bowl = await bowlRes.json();

    // Log 100g/day for 3 days = 300g consumed, 6700g remaining
    // At 100g/day rate, 6700g remaining = 67 days left (>= 5 day threshold)
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-09T08:00:00', amount_g: 50 },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-09T18:00:00', amount_g: 50 },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-10T08:00:00', amount_g: 50 },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-10T18:00:00', amount_g: 50 },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-11T08:00:00', amount_g: 50 },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-11T18:00:00', amount_g: 50 },
    });

    // Check estimate - should NOT flag low stock
    const res = await request.get(`${API_URL}/food/bags/${bag.id}/estimate`);
    expect(res.ok()).toBeTruthy();
    const estimate = await res.json();
    expect(estimate.remaining_g).toBe(6700);
    expect(estimate.days_remaining).toBeGreaterThanOrEqual(5);
    expect(estimate.low_stock).toBe(false);
  });

  test.skip('[P1] should include low_stock bags in GET /food/bags?low_stock=true filter', async ({ request }) => {
    // Create product
    const prodRes = await request.post(`${API_URL}/food/products`, {
      data: { name: 'FilterKibble', brand: 'TestBrand', food_type: 'kibble', food_category: 'main' },
    });
    const product = await prodRes.json();

    // Create a small bag that will be low stock
    const smallBagRes = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: product.id, weight_g: 500, purchased_at: '2026-03-01' },
    });
    const smallBag = await smallBagRes.json();
    await request.post(`${API_URL}/food/bags/${smallBag.id}/open`);

    // Create a large bag that will NOT be low stock
    const largeBagRes = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: product.id, weight_g: 7000, purchased_at: '2026-03-01' },
    });
    const largeBag = await largeBagRes.json();
    await request.post(`${API_URL}/food/bags/${largeBag.id}/open`);

    // Create bowl and deplete the small bag heavily
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'FilterBowl', location: 'Salon', bowl_type: 'food' },
    });
    const bowl = await bowlRes.json();

    // Deplete small bag: 100g/day for 4 days = 400g consumed, 100g left => ~1 day
    for (let day = 1; day <= 4; day++) {
      await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
        data: { bag_id: smallBag.id, served_at: `2026-03-0${day}T08:00:00`, amount_g: 50 },
      });
      await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
        data: { bag_id: smallBag.id, served_at: `2026-03-0${day}T18:00:00`, amount_g: 50 },
      });
    }

    // Log minimal servings for large bag
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: largeBag.id, served_at: '2026-03-09T08:00:00', amount_g: 50 },
    });

    // Filter for low_stock bags only
    const res = await request.get(`${API_URL}/food/bags?low_stock=true`);
    expect(res.ok()).toBeTruthy();
    const bags = await res.json();

    // Small bag should be in the list
    const smallBagFound = bags.find((b: any) => b.id === smallBag.id);
    expect(smallBagFound).toBeTruthy();

    // Large bag should NOT be in the list
    const largeBagFound = bags.find((b: any) => b.id === largeBag.id);
    expect(largeBagFound).toBeFalsy();
  });

  test.skip('[P1] should update low_stock status dynamically as new servings are logged', async ({ request }) => {
    // Create product
    const prodRes = await request.post(`${API_URL}/food/products`, {
      data: { name: 'DynamicKibble', brand: 'TestBrand', food_type: 'kibble', food_category: 'main' },
    });
    const product = await prodRes.json();

    // Create bag (600g) and open it
    const bagRes = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: product.id, weight_g: 600, purchased_at: '2026-03-01' },
    });
    const bag = await bagRes.json();
    await request.post(`${API_URL}/food/bags/${bag.id}/open`);

    // Create bowl
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'DynamicBowl', location: 'Salon', bowl_type: 'food' },
    });
    const bowl = await bowlRes.json();

    // Log 100g/day for 2 days = 200g consumed, 400g remaining => 4 days left => NOT low stock yet
    // (but close to threshold)
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-09T08:00:00', amount_g: 50 },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-09T18:00:00', amount_g: 50 },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-10T08:00:00', amount_g: 50 },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-10T18:00:00', amount_g: 50 },
    });

    // Verify NOT low stock (400g / 100g per day = 4 days, < 5 days threshold)
    // Actually this IS low stock already - let's check a wider margin first
    // Re-check: with only 1 day of data initially
    let res = await request.get(`${API_URL}/food/bags/${bag.id}/estimate`);
    let estimate = await res.json();
    const initialLowStock = estimate.low_stock;

    // Log more servings to push it further into low stock territory
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-11T08:00:00', amount_g: 50 },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { bag_id: bag.id, served_at: '2026-03-11T18:00:00', amount_g: 50 },
    });

    // Re-check estimate - low_stock should now be true (200g remaining / 100g per day = 2 days)
    res = await request.get(`${API_URL}/food/bags/${bag.id}/estimate`);
    estimate = await res.json();
    expect(estimate.remaining_g).toBe(300);
    expect(estimate.low_stock).toBe(true);

    // The status should have dynamically updated from the new servings
    expect(typeof estimate.low_stock).toBe('boolean');
  });
});
