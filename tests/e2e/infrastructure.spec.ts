import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:8000';
test.describe('Initialisation Architecture E2E Tests (ATDD)', () => {

  test('[P1] should access OpenAPI documentation', async ({ page }) => {
    await page.goto(`${API_URL}/docs`);

    await expect(page).toHaveTitle(/Swagger UI|FastAPI - Swagger UI/);

    await expect(page.getByText('Sakapuss API')).toBeVisible();
  });

  test('[P2] should verify Alembic migrations readiness via health endpoint', async ({ request }) => {
    const response = await request.get(`${API_URL}/health/migrations`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.migrations_ready).toBe(true);
    expect(body.current_revision).toBeDefined();
  });
});
