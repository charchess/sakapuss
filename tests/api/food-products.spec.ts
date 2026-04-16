import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Food Products CRUD (ATDD - Story 7.1)', () => {
  const createdIds: string[] = [];

  test.afterEach(async ({ request, authHeaders }) => {
    for (const id of createdIds.splice(0)) {
      await request.delete(`${API_URL}/food/products/${id}`, { headers: authHeaders });
    }
  });

  async function createProduct(request: any, authHeaders: any, data: object): Promise<any> {
    const res = await request.post(`${API_URL}/food/products`, { data, headers: authHeaders });
    const product = await res.json();
    createdIds.push(product.id);
    return { res, product };
  }

  test('[P0] should create a food product', async ({ request, authHeaders }) => {
    const { res, product } = await createProduct(request, authHeaders, {
      name: 'Quinoa Caille',
      brand: 'Farmina',
      food_type: 'kibble',
      food_category: 'main',
      default_bag_weight_g: 7000,
    });
    expect(res.status()).toBe(201);
    expect(product.name).toBe('Quinoa Caille');
    expect(product.brand).toBe('Farmina');
    expect(product.food_type).toBe('kibble');
    expect(product.food_category).toBe('main');
    expect(product.default_bag_weight_g).toBe(7000);
    expect(product.id).toBeTruthy();
  });

  test('[P0] should list food products', async ({ request, authHeaders }) => {
    await createProduct(request, authHeaders, { name: 'Product A', brand: 'Brand A', food_type: 'wet', food_category: 'main' });
    await createProduct(request, authHeaders, { name: 'Product B', brand: 'Brand B', food_type: 'treats', food_category: 'pleasure' });

    const res = await request.get(`${API_URL}/food/products`, { headers: authHeaders });
    expect(res.ok()).toBeTruthy();
    const products = await res.json();
    expect(products.length).toBeGreaterThanOrEqual(2);
  });

  test('[P0] should update a food product', async ({ request, authHeaders }) => {
    const { product } = await createProduct(request, authHeaders, { name: 'Old Name', brand: 'Old Brand', food_type: 'kibble', food_category: 'main' });

    const updateRes = await request.put(`${API_URL}/food/products/${product.id}`, {
      data: { name: 'New Name', brand: 'New Brand' },
      headers: authHeaders,
    });
    expect(updateRes.ok()).toBeTruthy();
    const updated = await updateRes.json();
    expect(updated.name).toBe('New Name');
    expect(updated.brand).toBe('New Brand');
    expect(updated.food_type).toBe('kibble');
  });

  test('[P0] should delete a food product', async ({ request, authHeaders }) => {
    const createRes = await request.post(`${API_URL}/food/products`, {
      data: { name: 'ToDelete', brand: 'X', food_type: 'kibble', food_category: 'main' },
      headers: authHeaders,
    });
    const product = await createRes.json();
    // Don't push to createdIds — we're testing delete here

    const deleteRes = await request.delete(`${API_URL}/food/products/${product.id}`, { headers: authHeaders });
    expect(deleteRes.status()).toBe(204);

    const getRes = await request.get(`${API_URL}/food/products`, { headers: authHeaders });
    const products = await getRes.json();
    expect(products.find((p: any) => p.id === product.id)).toBeUndefined();
  });

  test('[P1] should accept custom food types and categories', async ({ request, authHeaders }) => {
    const { res, product } = await createProduct(request, authHeaders, {
      name: 'Custom Food',
      brand: 'Custom Brand',
      food_type: 'raw_barf',
      food_category: 'therapeutic',
    });
    expect(res.status()).toBe(201);
    expect(product.food_type).toBe('raw_barf');
    expect(product.food_category).toBe('therapeutic');
  });
});
