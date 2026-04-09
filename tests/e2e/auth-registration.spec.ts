import { test, expect } from '../support/merged-fixtures';

test.describe('Auth Registration (ATDD - Story 1.2)', () => {

  test.skip('[P0] should register a new user and redirect to dashboard', async ({ page }) => {
    const ts = Date.now();
    const email = `user-${ts}@test.sakapuss.com`;

    await page.goto('/register');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!');
    await page.getByLabel('Confirm password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Register' }).click();

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test.skip('[P0] should show inline error on duplicate email', async ({ page }) => {
    const ts = Date.now();
    const email = `duplicate-${ts}@test.sakapuss.com`;

    // Register the first account
    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!');
    await page.getByLabel('Confirm password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL('/');

    // Attempt to register again with the same email
    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('AnotherPass456!');
    await page.getByLabel('Confirm password').fill('AnotherPass456!');
    await page.getByRole('button', { name: 'Register' }).click();

    // Should stay on register page and show inline error
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByText('email already exists', { exact: false })).toBeVisible();
  });

  test.skip('[P1] should show validation error for invalid email format', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!');
    await page.getByLabel('Confirm password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('valid email', { exact: false })).toBeVisible();
  });

  test.skip('[P1] should show validation error for short password', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill('short@test.sakapuss.com');
    await page.getByLabel('Password', { exact: true }).fill('ab');
    await page.getByLabel('Confirm password').fill('ab');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('password', { exact: false })).toBeVisible();
    // Error should mention minimum length
    await expect(page.getByText(/at least \d+ characters/i)).toBeVisible();
  });

  test.skip('[P1] should show validation error for mismatched passwords', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill('mismatch@test.sakapuss.com');
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!');
    await page.getByLabel('Confirm password').fill('DifferentPass456!');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('passwords do not match', { exact: false })).toBeVisible();
  });
});
