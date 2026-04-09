import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Reminders & Actions (ATDD - Stories 4.1, 4.3)', () => {

  let petId: string;

  test.beforeEach(async ({ request }) => {
    const petRes = await request.post(`${API_URL}/pets`, {
      data: { name: 'ReminderActionCat', species: 'Cat', birth_date: '2020-01-15' },
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

  test('[P0] should create a reminder with frequency_days and product', async ({ request }) => {
    const response = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Flea Treatment',
        frequency_days: 30,
        product: 'Frontline Plus',
        next_due_date: '2026-05-01',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.pet_id).toBe(petId);
    expect(body.name).toBe('Flea Treatment');
    expect(body.frequency_days).toBe(30);
    expect(body.product).toBe('Frontline Plus');
    expect(body.next_due_date).toContain('2026-05-01');
  });

  test('[P0] should list reminders with computed status', async ({ request }) => {
    const now = new Date();

    // Create an overdue reminder (due yesterday)
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Overdue Reminder',
        frequency_days: 30,
        next_due_date: yesterday.toISOString().split('T')[0],
      },
    });

    // Create a today reminder
    await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Today Reminder',
        frequency_days: 14,
        next_due_date: now.toISOString().split('T')[0],
      },
    });

    // Create an upcoming reminder (due in 10 days)
    const future = new Date(now);
    future.setDate(future.getDate() + 10);
    await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Upcoming Reminder',
        frequency_days: 60,
        next_due_date: future.toISOString().split('T')[0],
      },
    });

    const response = await request.get(`${API_URL}/pets/${petId}/reminders`);
    expect(response.status()).toBe(200);

    const reminders = await response.json();
    expect(Array.isArray(reminders)).toBe(true);
    expect(reminders.length).toBe(3);

    const overdue = reminders.find((r: any) => r.name === 'Overdue Reminder');
    expect(overdue.status).toBe('overdue');

    const today = reminders.find((r: any) => r.name === 'Today Reminder');
    expect(today.status).toBe('today');

    const upcoming = reminders.find((r: any) => r.name === 'Upcoming Reminder');
    expect(upcoming.status).toBe('upcoming');
  });

  test('[P0] should complete a reminder and recalculate next_due', async ({ request }) => {
    // Create a reminder with frequency_days=30
    const createRes = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Worming',
        frequency_days: 30,
        product: 'Milbemax',
        next_due_date: '2026-04-08',
      },
    });
    const reminder = await createRes.json();

    // Complete the reminder
    const response = await request.post(`${API_URL}/reminders/${reminder.id}/complete`, {
      data: {},
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.last_done_date).toBeDefined();
    // next_due should be recalculated: last_done_date + frequency_days
    const lastDone = new Date(body.last_done_date);
    const nextDue = new Date(body.next_due_date);
    const diffDays = Math.round((nextDue.getTime() - lastDone.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  test('[P0] should postpone a reminder by 3 days', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Postpone Test 3d',
        frequency_days: 30,
        next_due_date: '2026-04-10',
      },
    });
    const reminder = await createRes.json();

    const response = await request.post(`${API_URL}/reminders/${reminder.id}/postpone`, {
      data: { delay_days: 3 },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.next_due_date).toContain('2026-04-13');
  });

  test('[P1] should postpone a reminder by 7 days', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Postpone Test 7d',
        frequency_days: 30,
        next_due_date: '2026-04-10',
      },
    });
    const reminder = await createRes.json();

    const response = await request.post(`${API_URL}/reminders/${reminder.id}/postpone`, {
      data: { delay_days: 7 },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.next_due_date).toContain('2026-04-17');
  });

  test('[P1] should postpone a reminder by 14 days', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Postpone Test 14d',
        frequency_days: 30,
        next_due_date: '2026-04-10',
      },
    });
    const reminder = await createRes.json();

    const response = await request.post(`${API_URL}/reminders/${reminder.id}/postpone`, {
      data: { delay_days: 14 },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.next_due_date).toContain('2026-04-24');
  });

  test('[P1] should get reminder detail with full info', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Detail Test',
        frequency_days: 45,
        product: 'Advantage',
        next_due_date: '2026-05-15',
      },
    });
    const reminder = await createRes.json();

    const response = await request.get(`${API_URL}/reminders/${reminder.id}`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(reminder.id);
    expect(body.pet_id).toBe(petId);
    expect(body.name).toBe('Detail Test');
    expect(body.frequency_days).toBe(45);
    expect(body.product).toBe('Advantage');
    expect(body.next_due_date).toContain('2026-05-15');
    expect(body.last_done_date).toBeDefined();
    expect(body.status).toBeDefined();
  });
});
