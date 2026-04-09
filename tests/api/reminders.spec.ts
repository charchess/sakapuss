import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Reminders & Due Dates (ATDD - Story 3.1)', () => {

  let petId: string;

  test.beforeEach(async ({ request }) => {
    const petRes = await request.post(`${API_URL}/pets`, {
      data: { name: 'ReminderCat', species: 'Cat', birth_date: '2020-01-15' },
    });
    expect(petRes.ok()).toBeTruthy();
    const pet = await petRes.json();
    petId = pet.id;
  });

  test.afterEach(async ({ request }) => {
    if (petId) {
      await request.delete(`${API_URL}/pets/${petId}`);
    }
  });

  test('[P0] should auto-create reminder when vaccine event has period_months', async ({ request }) => {
    const response = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: '2026-03-01T10:00:00Z',
        payload: { name: 'Rabies', period_months: 12 },
      },
    });
    expect(response.status()).toBe(201);

    // Check pending reminders
    const remindersRes = await request.get(`${API_URL}/reminders/pending`);
    expect(remindersRes.ok()).toBeTruthy();
    const reminders = await remindersRes.json();

    const rabiesReminder = reminders.find((r: any) => r.name === 'Rabies');
    expect(rabiesReminder).toBeTruthy();
    expect(rabiesReminder.pet_id).toBe(petId);
    expect(rabiesReminder.type).toBe('vaccine');
    // occurred_at 2026-03-01 + 12 months = 2027-03-01
    expect(rabiesReminder.next_due_date).toContain('2027-03-01');
  });

  test('[P0] should auto-create reminder when treatment event has period_months', async ({ request }) => {
    const response = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'treatment',
        occurred_at: '2026-06-15T10:00:00Z',
        payload: { name: 'Antiparasite', period_months: 3 },
      },
    });
    expect(response.status()).toBe(201);

    const remindersRes = await request.get(`${API_URL}/reminders/pending`);
    expect(remindersRes.ok()).toBeTruthy();
    const reminders = await remindersRes.json();

    const antiparasiteReminder = reminders.find((r: any) => r.name === 'Antiparasite');
    expect(antiparasiteReminder).toBeTruthy();
    expect(antiparasiteReminder.next_due_date).toContain('2026-09-15');
  });

  test('[P1] should NOT create reminder when vaccine has no period_months', async ({ request }) => {
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: '2026-03-01T10:00:00Z',
        payload: { name: 'One-time shot' },
      },
    });

    const remindersRes = await request.get(`${API_URL}/reminders/pending`);
    expect(remindersRes.ok()).toBeTruthy();
    const reminders = await remindersRes.json();

    const match = reminders.find((r: any) => r.name === 'One-time shot');
    expect(match).toBeFalsy();
  });

  test('[P1] should return pending reminders sorted by date ASC', async ({ request }) => {
    // Create two vaccine events with different periods
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: '2026-03-01T10:00:00Z',
        payload: { name: 'FarAway', period_months: 24 },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'treatment',
        occurred_at: '2026-03-01T10:00:00Z',
        payload: { name: 'SoonDue', period_months: 1 },
      },
    });

    const remindersRes = await request.get(`${API_URL}/reminders/pending`);
    expect(remindersRes.ok()).toBeTruthy();
    const reminders = await remindersRes.json();

    expect(reminders.length).toBeGreaterThanOrEqual(2);
    // SoonDue (April 2026) should come before FarAway (March 2028)
    const soonIdx = reminders.findIndex((r: any) => r.name === 'SoonDue');
    const farIdx = reminders.findIndex((r: any) => r.name === 'FarAway');
    expect(soonIdx).toBeLessThan(farIdx);
  });

  test('[P1] should include pet_name in reminder response', async ({ request }) => {
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: '2026-03-01T10:00:00Z',
        payload: { name: 'Coryza', period_months: 12 },
      },
    });

    const remindersRes = await request.get(`${API_URL}/reminders/pending`);
    const reminders = await remindersRes.json();

    const coryza = reminders.find((r: any) => r.name === 'Coryza');
    expect(coryza.pet_name).toBe('ReminderCat');
  });

  test('[P2] should cascade delete reminders when pet is deleted', async ({ request }) => {
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: '2026-03-01T10:00:00Z',
        payload: { name: 'CascadeTest', period_months: 6 },
      },
    });

    // Verify reminder exists
    let remindersRes = await request.get(`${API_URL}/reminders/pending`);
    let reminders = await remindersRes.json();
    expect(reminders.find((r: any) => r.name === 'CascadeTest')).toBeTruthy();

    // Delete pet
    await request.delete(`${API_URL}/pets/${petId}`);
    petId = '';

    // Verify reminders gone
    remindersRes = await request.get(`${API_URL}/reminders/pending`);
    reminders = await remindersRes.json();
    expect(reminders.find((r: any) => r.name === 'CascadeTest')).toBeFalsy();
  });
});
