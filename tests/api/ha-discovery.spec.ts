import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Home Assistant MQTT Discovery (ATDD - Story 10.2)', () => {

  let petId: string;

  test.beforeEach(async ({ seedPet }) => {
    const pet = await seedPet({ name: 'DiscoveryCat' });
    petId = pet.id;
  });

  test('[P0] should return list of HA entities', async ({ request }) => {
    const response = await request.get(`${API_URL}/mqtt/discovery`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.entities).toBeDefined();
    expect(Array.isArray(body.entities)).toBe(true);
    expect(body.entities.length).toBeGreaterThan(0);
    expect(body.count).toBeGreaterThan(0);
  });

  test('[P0] should include sensor entity for weight per pet', async ({ request }) => {
    const response = await request.get(`${API_URL}/mqtt/discovery`);
    const body = await response.json();

    const weightSensor = body.entities.find(
      (e: any) => e.pet_id === petId && e.type === 'sensor'
    );
    expect(weightSensor).toBeTruthy();
    expect(weightSensor.entity_id).toContain('weight');
    expect(weightSensor.unit).toBe('kg');
  });

  test('[P0] should include binary_sensor entity for vaccine status', async ({ request }) => {
    const response = await request.get(`${API_URL}/mqtt/discovery`);
    const body = await response.json();

    const vaccineSensor = body.entities.find(
      (e: any) => e.pet_id === petId && e.type === 'binary_sensor'
    );
    expect(vaccineSensor).toBeTruthy();
    expect(vaccineSensor.entity_id).toContain('vaccine');
  });

  test('[P0] should include button entity per reminder', async ({ request, seedPet }) => {
    // Create a reminder for the pet
    await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: { name: 'Deworming', type: 'health', frequency_days: 90 },
    });

    const response = await request.get(`${API_URL}/mqtt/discovery`);
    const body = await response.json();

    const button = body.entities.find(
      (e: any) => e.pet_id === petId && e.type === 'button'
    );
    expect(button).toBeTruthy();
    expect(button.name).toContain('Deworming');
  });

  test('[P1] should include discovery_published in health/mqtt', async ({ request }) => {
    const response = await request.get(`${API_URL}/health/mqtt`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeDefined();
  });
});
