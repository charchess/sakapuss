import { test, expect } from '../support/merged-fixtures';

test.describe('Pets CRUD API (ATDD RED)', () => {
  test('[P0] should create a new pet profile', async ({ request }) => {
    const response = await request.post('/pets', {
      data: { name: 'Vanille', species: 'Cat', birth_date: '2020-03-15' },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.name).toBe('Vanille');
    expect(body.species).toBe('Cat');
    expect(body.birth_date).toBe('2020-03-15');
    expect(body.id).toBeDefined();
  });

  test('[P0] should list all pets', async ({ request }) => {
    const createResponse = await request.post('/pets', {
      data: { name: 'Pixel', species: 'Cat', birth_date: '2019-04-12' },
    });
    expect(createResponse.status()).toBe(201);

    const response = await request.get('/pets');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body.some((pet: { name: string }) => pet.name === 'Pixel')).toBe(true);
  });

  test('[P0] should retrieve a single pet by id', async ({ request }) => {
    const createResponse = await request.post('/pets', {
      data: { name: 'Mochi', species: 'Dog', birth_date: '2018-06-20' },
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    const response = await request.get(`/pets/${created.id}`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(created.id);
    expect(body.name).toBe('Mochi');
    expect(body.species).toBe('Dog');
  });

  test('[P0] should update a pet profile', async ({ request }) => {
    const createResponse = await request.post('/pets', {
      data: { name: 'Nala', species: 'Cat', birth_date: '2021-09-01' },
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    const response = await request.put(`/pets/${created.id}`, {
      data: { name: 'Nala Updated', species: 'Cat' },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(created.id);
    expect(body.name).toBe('Nala Updated');
  });

  test('[P0] should delete a pet profile', async ({ request }) => {
    const createResponse = await request.post('/pets', {
      data: { name: 'Biscuit', species: 'Rabbit', birth_date: '2017-11-10' },
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    const deleteResponse = await request.delete(`/pets/${created.id}`);
    expect(deleteResponse.status()).toBe(204);

    const fetchDeletedResponse = await request.get(`/pets/${created.id}`);
    expect(fetchDeletedResponse.status()).toBe(404);
  });

  test('[P1] should return 404 for non-existent pet', async ({ request }) => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await request.get(`/pets/${nonExistentId}`);

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.detail).toBeDefined();
  });

  test('[P1] should return validation error for invalid input', async ({ request }) => {
    const response = await request.post('/pets', {
      data: { name: '', species: 'Dragon', birth_date: '2999-01-01' },
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.detail).toBeDefined();
  });
});
