import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Food Bags Lifecycle (ATDD - Story 7.2)', () => {
  let productId: string;

  test.beforeEach(async ({ request }) => {
    const res = await request.post(`${API_URL}/food/products`, {
      data: {
        name: 'Test Kibble',
        brand: 'TestBrand',
        food_type: 'kibble',
        food_category: 'main',
        default_bag_weight_g: 7000,
      },
    });
    const product = await res.json();
    productId = product.id;
  });

  test('[P0] should create a bag in stocked status', async ({ request }) => {
    const res = await request.post(`${API_URL}/food/bags`, {
      data: {
        product_id: productId,
        weight_g: 7000,
        purchased_at: '2026-03-01',
      },
    });
    expect(res.status()).toBe(201);
    const bag = await res.json();
    expect(bag.status).toBe('stocked');
    expect(bag.weight_g).toBe(7000);
    expect(bag.product_id).toBe(productId);
    expect(bag.opened_at).toBeNull();
    expect(bag.depleted_at).toBeNull();
  });

  test('[P0] should open a bag', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 7000, purchased_at: '2026-03-01' },
    });
    const bag = await createRes.json();

    const openRes = await request.post(`${API_URL}/food/bags/${bag.id}/open`);
    expect(openRes.ok()).toBeTruthy();
    const opened = await openRes.json();
    expect(opened.status).toBe('opened');
    expect(opened.opened_at).toBeTruthy();
  });

  test('[P0] should deplete a bag', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 7000, purchased_at: '2026-03-01' },
    });
    const bag = await createRes.json();

    // Open first
    await request.post(`${API_URL}/food/bags/${bag.id}/open`);

    // Deplete
    const depleteRes = await request.post(`${API_URL}/food/bags/${bag.id}/deplete`);
    expect(depleteRes.ok()).toBeTruthy();
    const depleted = await depleteRes.json();
    expect(depleted.status).toBe('depleted');
    expect(depleted.depleted_at).toBeTruthy();
  });

  test('[P0] should list bags with status filter', async ({ request }) => {
    // Create two bags
    const r1 = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 7000, purchased_at: '2026-03-01' },
    });
    const bag1 = await r1.json();

    await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 3000, purchased_at: '2026-03-05' },
    });

    // Open bag1
    await request.post(`${API_URL}/food/bags/${bag1.id}/open`);

    // Filter opened
    const openedRes = await request.get(`${API_URL}/food/bags?bag_status=opened`);
    const openedBags = await openedRes.json();
    expect(openedBags.length).toBeGreaterThanOrEqual(1);
    expect(openedBags.every((b: any) => b.status === 'opened')).toBeTruthy();

    // Filter stocked
    const stockedRes = await request.get(`${API_URL}/food/bags?bag_status=stocked`);
    const stockedBags = await stockedRes.json();
    expect(stockedBags.length).toBeGreaterThanOrEqual(1);
    expect(stockedBags.every((b: any) => b.status === 'stocked')).toBeTruthy();
  });

  test('[P1] should have multiple bags simultaneously', async ({ request }) => {
    await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 7000, purchased_at: '2026-03-01' },
    });
    await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 3000, purchased_at: '2026-03-05' },
    });
    await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 1500, purchased_at: '2026-03-07' },
    });

    const res = await request.get(`${API_URL}/food/bags`);
    const bags = await res.json();
    expect(bags.length).toBeGreaterThanOrEqual(3);
  });
});
