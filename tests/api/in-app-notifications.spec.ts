import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('In-App Notifications (ATDD - Story 4.4)', () => {

  let petId: string;

  test.beforeEach(async ({ request }) => {
    const petRes = await request.post(`${API_URL}/pets`, {
      data: { name: 'NotifPet', species: 'Cat', birth_date: '2020-01-15' },
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

  test.skip('[P0] should list notifications', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/notifications`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test.skip('[P0] should filter unread notifications', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/notifications?unread=true`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    // All returned notifications should be unread
    for (const notif of body) {
      expect(notif.read).toBe(false);
    }
  });

  test.skip('[P0] should mark a notification as read', async ({ request }) => {
    // Create a reminder that will generate a notification
    const now = new Date();
    const dueSoon = new Date(now);
    dueSoon.setDate(dueSoon.getDate() + 5); // within J-7 window

    await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Mark Read Test',
        frequency_days: 30,
        next_due_date: dueSoon.toISOString().split('T')[0],
      },
    });

    // Fetch notifications to find one
    const listRes = await request.get(`${API_URL}/api/notifications?unread=true`);
    const notifications = await listRes.json();
    expect(notifications.length).toBeGreaterThan(0);

    const notifId = notifications[0].id;

    // Mark as read
    const response = await request.patch(`${API_URL}/api/notifications/${notifId}/read`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(notifId);
    expect(body.read).toBe(true);
  });

  test.skip('[P1] should create notification when reminder approaches J-7', async ({ request }) => {
    const now = new Date();
    const dueIn6Days = new Date(now);
    dueIn6Days.setDate(dueIn6Days.getDate() + 6);

    // Create a reminder due within 7 days
    await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'J-7 Notification Test',
        frequency_days: 30,
        next_due_date: dueIn6Days.toISOString().split('T')[0],
      },
    });

    // Check that a notification was created for the approaching reminder
    const response = await request.get(`${API_URL}/api/notifications`);
    expect(response.status()).toBe(200);

    const notifications = await response.json();
    const match = notifications.find(
      (n: any) => n.type === 'reminder_approaching' && n.pet_id === petId
    );
    expect(match).toBeTruthy();
    expect(match.message).toContain('J-7 Notification Test');
    expect(match.read).toBe(false);
  });

  test.skip('[P1] should create notification when reminder is overdue', async ({ request }) => {
    const now = new Date();
    const pastDue = new Date(now);
    pastDue.setDate(pastDue.getDate() - 2);

    // Create a reminder that is already overdue
    await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Overdue Notification Test',
        frequency_days: 30,
        next_due_date: pastDue.toISOString().split('T')[0],
      },
    });

    // Check that an overdue notification was created
    const response = await request.get(`${API_URL}/api/notifications`);
    expect(response.status()).toBe(200);

    const notifications = await response.json();
    const match = notifications.find(
      (n: any) => n.type === 'reminder_overdue' && n.pet_id === petId
    );
    expect(match).toBeTruthy();
    expect(match.message).toContain('Overdue Notification Test');
    expect(match.read).toBe(false);
  });
});
