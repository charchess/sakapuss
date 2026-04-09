import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('User Settings & Preferences (ATDD - Story 1.5)', () => {

  let accessToken: string;

  test.beforeEach(async ({ request }) => {
    const email = `settings-${Date.now()}-${Math.random().toString(36).slice(2)}@sakapuss.test`;
    const registerRes = await request.post(`${API_URL}/auth/register`, {
      data: { email, password: 'SecureP@ss123!' },
    });
    const body = await registerRes.json();
    accessToken = body.access_token;
  });

  test('[P0] should update display_name', async ({ request }) => {
    const response = await request.patch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { display_name: 'Cat Parent' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.display_name).toBe('Cat Parent');
  });

  test('[P0] should update language preference to French', async ({ request }) => {
    const response = await request.patch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { language: 'fr' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.language).toBe('fr');
  });

  test('[P1] should update language preference to English', async ({ request }) => {
    await request.patch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { language: 'fr' },
    });

    const response = await request.patch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { language: 'en' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.language).toBe('en');
  });

  test.skip('[P1] should update notification preferences', async ({ request }) => {
    // Notification preferences not yet implemented — Story 1.5 deferred
    const response = await request.patch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        notification_preferences: {
          reminders_enabled: true,
          anomalies_enabled: false,
        },
      },
    });
    expect(response.status()).toBe(200);
  });

  test('[P0] should return current settings via GET /auth/me', async ({ request }) => {
    await request.patch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { display_name: 'Settings Tester', language: 'fr' },
    });

    const response = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.display_name).toBe('Settings Tester');
    expect(body.language).toBe('fr');
  });
});
