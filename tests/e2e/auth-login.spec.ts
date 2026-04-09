import { test, expect } from '../support/merged-fixtures';

test.describe('Auth Login (ATDD - Story 1.3)', () => {

  test.skip('[P0] should log in with valid credentials and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('testuser@sakapuss.com');
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test.skip('[P0] should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('wrong@sakapuss.com');
    await page.getByLabel('Password').fill('WrongPassword!');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Should stay on login page with error message
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('invalid email or password', { exact: false })).toBeVisible();
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
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Should redirect back to the originally requested page
    await expect(page).toHaveURL('/settings');
  });
});
