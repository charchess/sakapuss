import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Authentication — Registration (ATDD - Story 1.2)', () => {

  const testPassword = 'SecureP@ss123!';

  test('[P0] should register a new account and return JWT', async ({ request }) => {
    const testEmail = `reg-${Date.now()}@sakapuss.test`;
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: testEmail,
        password: testPassword,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.access_token).toBeTruthy();
    expect(body.token_type).toBe('bearer');
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(testEmail);
    expect(body.user.id).toBeDefined();
  });

  test('[P0] should reject duplicate email registration', async ({ request }) => {
    const dupEmail = `dup-${Date.now()}@sakapuss.test`;

    // First registration
    await request.post(`${API_URL}/auth/register`, {
      data: { email: dupEmail, password: testPassword },
    });

    // Second registration with same email
    const response = await request.post(`${API_URL}/auth/register`, {
      data: { email: dupEmail, password: testPassword },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.detail).toBeDefined();
  });

  test('[P1] should reject registration with weak password', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `weak-${Date.now()}@sakapuss.test`,
        password: '123',
      },
    });

    expect(response.status()).toBe(422);
  });

  test('[P0] should return current user profile with valid JWT', async ({ request }) => {
    const regEmail = `me-${Date.now()}@sakapuss.test`;
    const registerRes = await request.post(`${API_URL}/auth/register`, {
      data: { email: regEmail, password: testPassword },
    });
    const { access_token } = await registerRes.json();

    const response = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.email).toBe(regEmail);
    expect(body.id).toBeDefined();
  });

  test('[P0] should return 401 for /auth/me without JWT', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/me`);
    expect(response.status()).toBe(401);
  });
});

test.describe('Authentication — Login (ATDD - Story 1.3)', () => {

  const testPassword = 'SecureP@ss123!';

  test('[P0] should login with valid credentials and return JWT', async ({ request }) => {
    const loginEmail = `login-${Date.now()}@sakapuss.test`;
    await request.post(`${API_URL}/auth/register`, {
      data: { email: loginEmail, password: testPassword },
    });

    const response = await request.post(`${API_URL}/auth/login`, {
      data: { email: loginEmail, password: testPassword },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.access_token).toBeTruthy();
    expect(body.token_type).toBe('bearer');
  });

  test('[P0] should reject login with invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'nonexistent@sakapuss.test',
        password: 'WrongPassword123!',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.detail).toBeDefined();
  });
});
