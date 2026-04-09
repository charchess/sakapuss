import { test, expect } from '@playwright/test';

test.describe('Initialisation Architecture API Tests (ATDD)', () => {

  test('[P0] should return 200 OK on root endpoint', async ({ request }) => {
    const response = await request.get('/');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      status: 'healthy',
      app: 'sakapuss'
    });
  });

  test('[P0] should return {"status": "ok"} on /health endpoint', async ({ request }) => {
    const response = await request.get('/health');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });

  test('[P0] should verify database connectivity', async ({ request }) => {
    const response = await request.get('/health/db');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.database).toBe('connected');
  });
});
