import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Food Bags Lifecycle (ATDD - Story 7.2)', () => {
  let productId: string;

  test.beforeEach(async ({ request, authHeaders }) => {
    const res = await request.post(`${API_URL}/food/products`, {
      data: {
        name: 'Test Kibble',
        brand: 'TestBrand',
        food_type: 'kibble',
        food_category: 'main',
        default_bag_weight_g: 7000,
      },
      headers: authHeaders,
    });
    const product = await res.json();
    productId = product.id;
  });

  test.afterEach(async ({ request, authHeaders }) => {
    if (productId) {
      await request.delete(`${API_URL}/food/products/${productId}`, { headers: authHeaders });
    }
  });

  test('[P0] should create a bag in stocked status', async ({ request, authHeaders }) => {
    const res = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 7000, purchased_at: '2026-03-01' },
      headers: authHeaders,
    });
    expect(res.status()).toBe(201);
    const bag = await res.json();
    expect(bag.status).toBe('stocked');
    expect(bag.weight_g).toBe(7000);
    expect(bag.product_id).toBe(productId);
    expect(bag.opened_at).toBeNull();
    expect(bag.depleted_at).toBeNull();
  });

  test('[P0] should open a bag', async ({ request, authHeaders }) => {
    const createRes = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 7000, purchased_at: '2026-03-01' },
      headers: authHeaders,
    });
    const bag = await createRes.json();

    const openRes = await request.post(`${API_URL}/food/bags/${bag.id}/open`, { headers: authHeaders });
    expect(openRes.ok()).toBeTruthy();
    const opened = await openRes.json();
    expect(opened.status).toBe('opened');
    expect(opened.opened_at).toBeTruthy();
  });

  test('[P0] should deplete a bag', async ({ request, authHeaders }) => {
    const createRes = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 7000, purchased_at: '2026-03-01' },
      headers: authHeaders,
    });
    const bag = await createRes.json();

    await request.post(`${API_URL}/food/bags/${bag.id}/open`, { headers: authHeaders });

    const depleteRes = await request.post(`${API_URL}/food/bags/${bag.id}/deplete`, { headers: authHeaders });
    expect(depleteRes.ok()).toBeTruthy();
    const depleted = await depleteRes.json();
    expect(depleted.status).toBe('depleted');
    expect(depleted.depleted_at).toBeTruthy();
  });

  test('[P0] should list bags with status filter', async ({ request, authHeaders }) => {
    const r1 = await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 7000, purchased_at: '2026-03-01' },
      headers: authHeaders,
    });
    const bag1 = await r1.json();

    await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 3000, purchased_at: '2026-03-05' },
      headers: authHeaders,
    });

    await request.post(`${API_URL}/food/bags/${bag1.id}/open`, { headers: authHeaders });

    const openedRes = await request.get(`${API_URL}/food/bags?bag_status=opened`, { headers: authHeaders });
    const openedBags = await openedRes.json();
    expect(openedBags.length).toBeGreaterThanOrEqual(1);
    expect(openedBags.every((b: any) => b.status === 'opened')).toBeTruthy();

    const stockedRes = await request.get(`${API_URL}/food/bags?bag_status=stocked`, { headers: authHeaders });
    const stockedBags = await stockedRes.json();
    expect(stockedBags.length).toBeGreaterThanOrEqual(1);
    expect(stockedBags.every((b: any) => b.status === 'stocked')).toBeTruthy();
  });

  test('[P1] should have multiple bags simultaneously', async ({ request, authHeaders }) => {
    await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 7000, purchased_at: '2026-03-01' },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 3000, purchased_at: '2026-03-05' },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/food/bags`, {
      data: { product_id: productId, weight_g: 1500, purchased_at: '2026-03-07' },
      headers: authHeaders,
    });

    const res = await request.get(`${API_URL}/food/bags`, { headers: authHeaders });
    const bags = await res.json();
    expect(bags.length).toBeGreaterThanOrEqual(3);
  });
});
