import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Extended Pet Profile (ATDD - Story 6.1)', () => {

  test('[P0] should create a pet with extended fields', async ({ request }) => {
    const res = await request.post(`${API_URL}/pets`, {
      data: {
        name: 'Vanille',
        species: 'Cat',
        birth_date: '2018-05-10',
        breed: 'Maine Coon',
        sterilized: true,
        microchip: '250269812345678',
        vet_name: 'Dr. Dupont',
        vet_phone: '01 23 45 67 89',
      },
    });
    expect(res.status()).toBe(201);
    const pet = await res.json();
    expect(pet.breed).toBe('Maine Coon');
    expect(pet.sterilized).toBe(true);
    expect(pet.microchip).toBe('250269812345678');
    expect(pet.vet_name).toBe('Dr. Dupont');
    expect(pet.vet_phone).toBe('01 23 45 67 89');
  });

  test('[P0] should create a pet without extended fields (backward compat)', async ({ request }) => {
    const res = await request.post(`${API_URL}/pets`, {
      data: {
        name: 'Mina',
        species: 'Cat',
        birth_date: '2020-01-15',
      },
    });
    expect(res.status()).toBe(201);
    const pet = await res.json();
    expect(pet.breed).toBeNull();
    expect(pet.sterilized).toBeNull();
    expect(pet.microchip).toBeNull();
    expect(pet.vet_name).toBeNull();
    expect(pet.vet_phone).toBeNull();
  });

  test('[P1] should update extended fields', async ({ request }) => {
    // Create pet
    const createRes = await request.post(`${API_URL}/pets`, {
      data: { name: 'Rex', species: 'Dog', birth_date: '2019-03-20' },
    });
    const pet = await createRes.json();

    // Update with extended fields
    const updateRes = await request.put(`${API_URL}/pets/${pet.id}`, {
      data: {
        breed: 'Labrador',
        sterilized: false,
        microchip: '250269800000001',
        vet_name: 'Dr. Martin',
        vet_phone: '06 12 34 56 78',
      },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updated = await updateRes.json();
    expect(updated.breed).toBe('Labrador');
    expect(updated.sterilized).toBe(false);
    expect(updated.vet_name).toBe('Dr. Martin');
  });
});
