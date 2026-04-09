import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Food Products CRUD (ATDD - Story 7.1)', () => {

  test('[P0] should create a food product', async ({ request }) => {
    const res = await request.post(`${API_URL}/food/products`, {
      data: {
        name: 'Quinoa Caille',
        brand: 'Farmina',
        food_type: 'kibble',
        food_category: 'main',
        default_bag_weight_g: 7000,
      },
    });
    expect(res.status()).toBe(201);
    const product = await res.json();
    expect(product.name).toBe('Quinoa Caille');
    expect(product.brand).toBe('Farmina');
    expect(product.food_type).toBe('kibble');
    expect(product.food_category).toBe('main');
    expect(product.default_bag_weight_g).toBe(7000);
    expect(product.id).toBeTruthy();
  });

  test('[P0] should list food products', async ({ request }) => {
    // Create two products
    await request.post(`${API_URL}/food/products`, {
      data: { name: 'Product A', brand: 'Brand A', food_type: 'wet', food_category: 'main' },
    });
    await request.post(`${API_URL}/food/products`, {
      data: { name: 'Product B', brand: 'Brand B', food_type: 'treats', food_category: 'pleasure' },
    });

    const res = await request.get(`${API_URL}/food/products`);
    expect(res.ok()).toBeTruthy();
    const products = await res.json();
    expect(products.length).toBeGreaterThanOrEqual(2);
  });

  test('[P0] should update a food product', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/food/products`, {
      data: { name: 'Old Name', brand: 'Old Brand', food_type: 'kibble', food_category: 'main' },
    });
    const product = await createRes.json();

    const updateRes = await request.put(`${API_URL}/food/products/${product.id}`, {
      data: { name: 'New Name', brand: 'New Brand' },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updated = await updateRes.json();
    expect(updated.name).toBe('New Name');
    expect(updated.brand).toBe('New Brand');
    expect(updated.food_type).toBe('kibble'); // unchanged
  });

  test('[P0] should delete a food product', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/food/products`, {
      data: { name: 'ToDelete', brand: 'X', food_type: 'kibble', food_category: 'main' },
    });
    const product = await createRes.json();

    const deleteRes = await request.delete(`${API_URL}/food/products/${product.id}`);
    expect(deleteRes.status()).toBe(204);

    // Verify gone
    const getRes = await request.get(`${API_URL}/food/products`);
    const products = await getRes.json();
    expect(products.find((p: any) => p.id === product.id)).toBeUndefined();
  });

  test('[P1] should accept custom food types and categories', async ({ request }) => {
    const res = await request.post(`${API_URL}/food/products`, {
      data: {
        name: 'Custom Food',
        brand: 'Custom Brand',
        food_type: 'raw_barf',
        food_category: 'therapeutic',
      },
    });
    expect(res.status()).toBe(201);
    const product = await res.json();
    expect(product.food_type).toBe('raw_barf');
    expect(product.food_category).toBe('therapeutic');
  });
});
