import { test, expect } from '../support/merged-fixtures';

test.describe('Auth Login (ATDD - Story 1.3)', () => {

  test('[P0] should log in with valid credentials and redirect to dashboard', async ({ page, request }) => {
    // Register a user first
    const ts = Date.now();
    const email = `login-${ts}@test.sakapuss.com`;
    await request.post('http://localhost:8000/auth/register', {
      data: { email, password: 'SecurePass123!' },
    });

    await page.goto('/login');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mot de passe').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
  });

  test('[P0] should show error on invalid credentials', async ({ page }) => {
    // Clear auth state — this test must run unauthenticated
    await page.addInitScript(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); });
    await page.goto('/login');

    await page.getByLabel('Email').fill('wrong@sakapuss.com');
    await page.getByLabel('Mot de passe').fill('WrongPassword!');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Should stay on login page with error message
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('invalide', { exact: false })).toBeVisible();
  });

  test.skip('[P0] should redirect unauthenticated user to /login with redirect param', async ({ page }) => {
    // Visit a protected page without being logged in
    await page.goto('/settings');

    // Should redirect to login with a redirect query parameter
    await expect(page).toHaveURL(/\/login\?redirect=%2Fsettings/);
  });

  test.skip('[P1] should redirect back to original page after login', async ({ page }) => {
    // Visit a protected page without being logged in
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login\?redirect=/);

    // Log in
    await page.getByLabel('Email').fill('testuser@sakapuss.com');
    await page.getByLabel('Mot de passe').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Should redirect back to the originally requested page
    await expect(page).toHaveURL('/settings');
  });
});
