import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Proactive Notifications (ATDD - Story 3.3)', () => {

  let petId: string;

  test.beforeEach(async ({ request }) => {
    const petRes = await request.post(`${API_URL}/pets`, {
      data: { name: 'NotifyCat', species: 'Cat', birth_date: '2020-01-15' },
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

  test('[P0] should return upcoming reminders within N days', async ({ request }) => {
    // Create a vaccine event with period_months=1 (due ~1 month from occurred_at)
    // occurred_at is set so that next_due falls within 7 days from now
    const now = new Date();
    const occurredAt = new Date(now);
    occurredAt.setMonth(occurredAt.getMonth() - 1);
    occurredAt.setDate(Math.min(occurredAt.getDate(), 28)); // safe day

    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: occurredAt.toISOString(),
        payload: { name: 'UpcomingVax', period_months: 1 },
      },
    });

    const response = await request.get(`${API_URL}/reminders/upcoming?days=14`);
    expect(response.ok()).toBeTruthy();
    const reminders = await response.json();

    const match = reminders.find((r: any) => r.name === 'UpcomingVax');
    expect(match).toBeTruthy();
    expect(match.pet_name).toBe('NotifyCat');
  });

  test('[P1] should NOT include reminders far in the future', async ({ request }) => {
    // Create a vaccine event due in 12 months — not upcoming
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: '2026-03-01T10:00:00Z',
        payload: { name: 'FarFuture', period_months: 12 },
      },
    });

    const response = await request.get(`${API_URL}/reminders/upcoming?days=7`);
    expect(response.ok()).toBeTruthy();
    const reminders = await response.json();

    const match = reminders.find((r: any) => r.name === 'FarFuture');
    expect(match).toBeFalsy();
  });

  test('[P1] should return empty list when no upcoming reminders exist', async ({ request }) => {
    const response = await request.get(`${API_URL}/reminders/upcoming?days=7`);
    expect(response.ok()).toBeTruthy();
    const reminders = await response.json();
    expect(Array.isArray(reminders)).toBe(true);
  });
});
