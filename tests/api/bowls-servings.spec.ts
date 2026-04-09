import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Bowls & Servings (ATDD - Stories 8.1, 8.2, 8.3)', () => {

  test('[P0] should create a food bowl', async ({ request }) => {
    const res = await request.post(`${API_URL}/bowls`, {
      data: {
        name: 'Salon A',
        location: 'Salon',
        capacity_g: 200,
        bowl_type: 'food',
      },
    });
    expect(res.status()).toBe(201);
    const bowl = await res.json();
    expect(bowl.name).toBe('Salon A');
    expect(bowl.bowl_type).toBe('food');
    expect(bowl.location).toBe('Salon');
  });

  test('[P0] should create a water bowl', async ({ request }) => {
    const res = await request.post(`${API_URL}/bowls`, {
      data: {
        name: 'Cuisine Eau',
        location: 'Cuisine',
        capacity_g: 500,
        bowl_type: 'water',
      },
    });
    expect(res.status()).toBe(201);
    const bowl = await res.json();
    expect(bowl.bowl_type).toBe('water');
  });

  test('[P0] should list bowls', async ({ request }) => {
    await request.post(`${API_URL}/bowls`, {
      data: { name: 'Bowl1', location: 'A', bowl_type: 'food' },
    });
    await request.post(`${API_URL}/bowls`, {
      data: { name: 'Bowl2', location: 'B', bowl_type: 'water' },
    });

    const res = await request.get(`${API_URL}/bowls`);
    expect(res.ok()).toBeTruthy();
    const bowls = await res.json();
    expect(bowls.length).toBeGreaterThanOrEqual(2);
  });

  test('[P0] should delete a bowl', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'ToDelete', location: 'X', bowl_type: 'food' },
    });
    const bowl = await createRes.json();

    const deleteRes = await request.delete(`${API_URL}/bowls/${bowl.id}`);
    expect(deleteRes.status()).toBe(204);
  });

  test('[P0] should fill a bowl and log serving', async ({ request, seedPet }) => {
    // Create bowl
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'ServeBowl', location: 'Salon', bowl_type: 'food' },
    });
    const bowl = await bowlRes.json();

    // Create pet
    const pet = await seedPet({ name: 'ServeCat' });

    // Fill bowl
    const fillRes = await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: {
        pet_id: pet.id,
        served_at: '2026-03-09T10:00:00',
        amount_g: 50,
        notes: 'Morning meal',
      },
    });
    expect(fillRes.status()).toBe(201);
    const serving = await fillRes.json();
    expect(serving.bowl_id).toBe(bowl.id);
    expect(serving.pet_id).toBe(pet.id);
    expect(serving.amount_g).toBe(50);
    expect(serving.notes).toBe('Morning meal');
  });

  test('[P0] should list servings for a bowl', async ({ request }) => {
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'HistBowl', location: 'A', bowl_type: 'food' },
    });
    const bowl = await bowlRes.json();

    // Log two servings
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { served_at: '2026-03-09T08:00:00', amount_g: 40 },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { served_at: '2026-03-09T18:00:00', amount_g: 45 },
    });

    const res = await request.get(`${API_URL}/bowls/${bowl.id}/servings`);
    expect(res.ok()).toBeTruthy();
    const servings = await res.json();
    expect(servings.length).toBe(2);
  });

  test('[P0] should list servings per pet', async ({ request, seedPet }) => {
    const pet = await seedPet({ name: 'PetServings' });
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'PetBowl', location: 'B', bowl_type: 'food' },
    });
    const bowl = await bowlRes.json();

    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { pet_id: pet.id, served_at: '2026-03-09T12:00:00', amount_g: 60 },
    });

    const res = await request.get(`${API_URL}/pets/${pet.id}/servings`);
    expect(res.ok()).toBeTruthy();
    const servings = await res.json();
    expect(servings.length).toBeGreaterThanOrEqual(1);
    expect(servings[0].pet_id).toBe(pet.id);
  });

  test('[P1] should fill water bowl without bag', async ({ request }) => {
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'WaterBowl', location: 'Salon', capacity_g: 500, bowl_type: 'water' },
    });
    const bowl = await bowlRes.json();

    const fillRes = await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { served_at: '2026-03-09T09:00:00', amount_g: 500 },
    });
    expect(fillRes.status()).toBe(201);
    const serving = await fillRes.json();
    expect(serving.bag_id).toBeNull();
    expect(serving.amount_g).toBe(500);
  });
});
