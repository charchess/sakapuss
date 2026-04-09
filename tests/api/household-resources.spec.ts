import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Household Resources (ATDD - Story 3.6)', () => {

  const createdResourceIds: string[] = [];

  test.afterEach(async ({ request }) => {
    for (const id of createdResourceIds) {
      await request.delete(`${API_URL}/resources/${id}`);
    }
    createdResourceIds.length = 0;
  });

  test('[P0] should create a litter resource', async ({ request }) => {
    const response = await request.post(`${API_URL}/resources`, {
      data: {
        name: 'Living Room Litter Box',
        type: 'litter',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.name).toBe('Living Room Litter Box');
    expect(body.type).toBe('litter');
    createdResourceIds.push(body.id);
  });

  test('[P0] should create a food_bowl resource', async ({ request }) => {
    const response = await request.post(`${API_URL}/resources`, {
      data: {
        name: 'Kitchen Food Bowl',
        type: 'food_bowl',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.name).toBe('Kitchen Food Bowl');
    expect(body.type).toBe('food_bowl');
    createdResourceIds.push(body.id);
  });

  test('[P0] should create a water resource', async ({ request }) => {
    const response = await request.post(`${API_URL}/resources`, {
      data: {
        name: 'Bedroom Water Fountain',
        type: 'water',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.name).toBe('Bedroom Water Fountain');
    expect(body.type).toBe('water');
    createdResourceIds.push(body.id);
  });

  test('[P0] should list all resources', async ({ request }) => {
    // Create two resources
    const res1 = await request.post(`${API_URL}/resources`, {
      data: { name: 'Litter A', type: 'litter' },
    });
    const r1 = await res1.json();
    createdResourceIds.push(r1.id);

    const res2 = await request.post(`${API_URL}/resources`, {
      data: { name: 'Bowl B', type: 'food_bowl' },
    });
    const r2 = await res2.json();
    createdResourceIds.push(r2.id);

    const response = await request.get(`${API_URL}/resources`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(2);
  });

  test('[P1] should filter resources by type', async ({ request }) => {
    // Create resources of different types
    const res1 = await request.post(`${API_URL}/resources`, {
      data: { name: 'Filter Litter', type: 'litter' },
    });
    const r1 = await res1.json();
    createdResourceIds.push(r1.id);

    const res2 = await request.post(`${API_URL}/resources`, {
      data: { name: 'Filter Bowl', type: 'food_bowl' },
    });
    const r2 = await res2.json();
    createdResourceIds.push(r2.id);

    // Filter for litter only
    const response = await request.get(`${API_URL}/resources?type=litter`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.every((r: any) => r.type === 'litter')).toBe(true);
    expect(body.some((r: any) => r.name === 'Filter Litter')).toBe(true);
  });

  test('[P0] should update a resource name', async ({ request }) => {
    // Create a resource
    const createRes = await request.post(`${API_URL}/resources`, {
      data: { name: 'Old Name', type: 'water' },
    });
    const created = await createRes.json();
    createdResourceIds.push(created.id);

    // Update its name
    const response = await request.patch(`${API_URL}/resources/${created.id}`, {
      data: { name: 'New Name' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(created.id);
    expect(body.name).toBe('New Name');
    expect(body.type).toBe('water');
  });

  test('[P0] should delete a resource', async ({ request }) => {
    // Create a resource
    const createRes = await request.post(`${API_URL}/resources`, {
      data: { name: 'To Delete', type: 'litter' },
    });
    const created = await createRes.json();

    // Delete it
    const deleteRes = await request.delete(`${API_URL}/resources/${created.id}`);
    expect(deleteRes.status()).toBe(204);

    // Verify it is gone
    const getRes = await request.get(`${API_URL}/resources/${created.id}`);
    expect(getRes.status()).toBe(404);
  });
});
