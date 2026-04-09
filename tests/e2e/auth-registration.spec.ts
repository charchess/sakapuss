import { test, expect } from '../support/merged-fixtures';

test.describe('Auth Registration (ATDD - Story 1.2)', () => {

  test('[P0] should register a new user and redirect to dashboard', async ({ page }) => {
    const ts = Date.now();
    const email = `user-${ts}@test.sakapuss.com`;

    await page.goto('/register');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mot de passe', { exact: true }).fill('SecurePass123!');
    await page.getByLabel('Confirmer le mot de passe').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Créer mon compte' }).click();

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/');
  });

  test('[P0] should show inline error on duplicate email', async ({ page }) => {
    const ts = Date.now();
    const email = `duplicate-${ts}@test.sakapuss.com`;

    // Register the first account
    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mot de passe', { exact: true }).fill('SecurePass123!');
    await page.getByLabel('Confirmer le mot de passe').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Créer mon compte' }).click();
    await expect(page).toHaveURL('/');

    // Attempt to register again with the same email
    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mot de passe', { exact: true }).fill('AnotherPass456!');
    await page.getByLabel('Confirmer le mot de passe').fill('AnotherPass456!');
    await page.getByRole('button', { name: 'Créer mon compte' }).click();

    // Should stay on register page and show inline error
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByText('existe déjà', { exact: false })).toBeVisible();
  });

  test('[P1] should show validation error for invalid email format', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Mot de passe', { exact: true }).fill('SecurePass123!');
    await page.getByLabel('Confirmer le mot de passe').fill('SecurePass123!');
    // Button is disabled when form is invalid, so we trigger validation by tabbing away
    await page.getByLabel('Email').blur();

    await expect(page.getByText("Format d'email invalide", { exact: false })).toBeVisible();
  });

  test('[P1] should show validation error for short password', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill('short@test.sakapuss.com');
    await page.getByLabel('Mot de passe', { exact: true }).fill('ab');
    await page.getByLabel('Mot de passe', { exact: true }).blur();

    await expect(page.getByText('8 caractères minimum', { exact: false })).toBeVisible();
  });

  test('[P1] should show validation error for mismatched passwords', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill('mismatch@test.sakapuss.com');
    await page.getByLabel('Mot de passe', { exact: true }).fill('SecurePass123!');
    await page.getByLabel('Confirmer le mot de passe').fill('DifferentPass456!');
    await page.getByLabel('Confirmer le mot de passe').blur();

    await expect(page.getByText('ne correspondent pas', { exact: false })).toBeVisible();
  });
});
