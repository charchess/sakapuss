import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Vet Share Links (ATDD - Story 7.1)', () => {

  let petId: string;

  test.beforeEach(async ({ request }) => {
    const petRes = await request.post(`${API_URL}/pets`, {
      data: { name: 'VetShareCat', species: 'Cat', birth_date: '2022-01-01' },
    });
    const pet = await petRes.json();
    petId = pet.id;
  });

  test.afterEach(async ({ request }) => {
    if (petId) await request.delete(`${API_URL}/pets/${petId}`);
  });

  test('[P0] should create a vet access link', async ({ request }) => {
    const response = await request.post(`${API_URL}/vet-shares`, {
      data: { pet_ids: [petId], vet_email: 'dr.smith@vetclinic.com' },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.token).toBeDefined();
    expect(body.url).toContain('/vet/dossier/');
    expect(body.vet_email).toBe('dr.smith@vetclinic.com');
    expect(body.pet_ids).toEqual([petId]);
  });

  test('[P0] should access vet dossier via token (no auth)', async ({ request }) => {
    const shareRes = await request.post(`${API_URL}/vet-shares`, {
      data: { pet_ids: [petId], vet_email: 'dr.jones@vetclinic.com' },
    });
    const share = await shareRes.json();

    const response = await request.get(`${API_URL}/vet/dossier/${share.token}`);
    expect(response.status()).toBe(200);

    const dossier = await response.json();
    expect(dossier.pet).toBeDefined();
    expect(dossier.pet.name).toBe('VetShareCat');
    expect(dossier.events).toBeDefined();
    expect(dossier.reminders).toBeDefined();
    expect(dossier._meta).toBeDefined();
  });

  test('[P0] should return 410 Gone for revoked token', async ({ request }) => {
    const shareRes = await request.post(`${API_URL}/vet-shares`, {
      data: { pet_ids: [petId], vet_email: 'dr.revoke@vetclinic.com' },
    });
    const share = await shareRes.json();

    await request.delete(`${API_URL}/vet-shares/${share.id}`);

    const response = await request.get(`${API_URL}/vet/dossier/${share.token}`);
    expect(response.status()).toBe(410);
  });

  test('[P0] should revoke a vet access link', async ({ request }) => {
    const shareRes = await request.post(`${API_URL}/vet-shares`, {
      data: { pet_ids: [petId], vet_email: 'dr.del@vetclinic.com' },
    });
    const share = await shareRes.json();

    const deleteRes = await request.delete(`${API_URL}/vet-shares/${share.id}`);
    expect(deleteRes.status()).toBe(204);
  });

  test('[P1] should list all vet shares', async ({ request }) => {
    await request.post(`${API_URL}/vet-shares`, {
      data: { pet_ids: [petId], vet_email: 'dr.list@vetclinic.com' },
    });

    const response = await request.get(`${API_URL}/vet-shares`);
    expect(response.status()).toBe(200);
    const shares = await response.json();
    expect(Array.isArray(shares)).toBe(true);
    expect(shares.length).toBeGreaterThanOrEqual(1);
  });

  test('[P1] should return 404 for invalid dossier token', async ({ request }) => {
    const response = await request.get(`${API_URL}/vet/dossier/nonexistent-token`);
    expect(response.status()).toBe(404);
  });
});

test.describe('Vet Portal Accounts (ATDD - Story 7.4)', () => {

  let petId: string;

  test.beforeEach(async ({ request }) => {
    const petRes = await request.post(`${API_URL}/pets`, {
      data: { name: 'VetPortalCat', species: 'Cat', birth_date: '2022-01-01' },
    });
    const pet = await petRes.json();
    petId = pet.id;
  });

  test.afterEach(async ({ request }) => {
    if (petId) await request.delete(`${API_URL}/pets/${petId}`);
  });

  test('[P0] should create a vet portal account', async ({ request }) => {
    const response = await request.post(`${API_URL}/vet/accounts`, {
      data: { email: `vet-${Date.now()}@clinic.com`, name: 'Dr. Martin', password: 'VetPass123!', practice_name: 'Cabinet Martin' },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.name).toBe('Dr. Martin');
    expect(body.practice_name).toBe('Cabinet Martin');
  });

  test('[P0] should list patients linked to vet account', async ({ request }) => {
    const vetEmail = `vet-list-${Date.now()}@clinic.com`;
    await request.post(`${API_URL}/vet-shares`, {
      data: { pet_ids: [petId], vet_email: vetEmail },
    });

    const response = await request.get(`${API_URL}/vet/patients?email=${vetEmail}`);
    expect(response.status()).toBe(200);
    const patients = await response.json();
    expect(patients.length).toBeGreaterThanOrEqual(1);
    expect(patients[0].name).toBe('VetPortalCat');
  });

  test('[P1] should search patients by name', async ({ request }) => {
    const vetEmail = `vet-search-${Date.now()}@clinic.com`;
    await request.post(`${API_URL}/vet-shares`, {
      data: { pet_ids: [petId], vet_email: vetEmail },
    });

    const response = await request.get(`${API_URL}/vet/patients?email=${vetEmail}&search=VetPortal`);
    expect(response.status()).toBe(200);
    const patients = await response.json();
    expect(patients.length).toBe(1);
  });

  test('[P1] should return empty list for search with no matches', async ({ request }) => {
    const vetEmail = `vet-empty-${Date.now()}@clinic.com`;
    const response = await request.get(`${API_URL}/vet/patients?email=${vetEmail}&search=Nonexistent`);
    expect(response.status()).toBe(200);
    const patients = await response.json();
    expect(patients.length).toBe(0);
  });
});
