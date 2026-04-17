import { test, expect } from '../support/merged-fixtures';

test.describe('Onboarding Flow (ATDD - Story 2.6)', () => {
  test.describe.configure({ mode: 'serial' });

  // Remove onboarding_done so the redirect test (first in serial chain) starts fresh.
  // The last test (returning user) relies on onboarding_done being set by wizard tests earlier in the chain.
  test.beforeAll(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('onboarding_done'));
  });

  test('[P0] should redirect to onboarding after adding first animal', async ({ page, seedPet }) => {
    await seedPet({ name: `Onboard-${Date.now()}` });
    // networkidle ensures all SvelteKit API calls have completed and onMount has fired
    // before we poll for the redirect URL
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
  });

  test('[P0] should display 3 wizard steps: Health Reminders, Weight, Food', async ({ page, seedPet }) => {
    await seedPet({ name: `Wizard-${Date.now()}` });
    await page.goto('/onboarding');

    // Step indicators should show 3 dots
    await expect(page.locator('.progress-dots .dot')).toHaveCount(3);
    await expect(page.getByText('Rappels santé')).toBeVisible();

    // Verify step navigation exists
    await expect(page.getByRole('button', { name: 'Continuer' })).toBeVisible();
  });

  test('[P0] should allow skipping all steps and show celebration screen', async ({ page, seedPet }) => {
    await seedPet({ name: `Skipper-${Date.now()}` });
    await page.goto('/onboarding');

    // Step 1: Health Reminders - skip (wait for step 2 before proceeding)
    await expect(page.getByTestId('wizard-health')).toBeVisible();
    await page.getByRole('button', { name: 'Passer' }).click();

    // Step 2: Weight - skip (wait for step 3 before proceeding)
    await expect(page.getByTestId('wizard-weight')).toBeVisible();
    await page.getByRole('button', { name: 'Passer' }).click();

    // Step 3: Food - skip
    await expect(page.getByTestId('wizard-food')).toBeVisible();
    await page.getByRole('button', { name: 'Passer' }).click();

    // Should see celebration screen
    await expect(page.getByText('est prêt', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Aller au dashboard' })).toBeVisible();

    // Clicking the button should redirect to dashboard
    await page.getByRole('button', { name: 'Aller au dashboard' }).click();
    await expect(page).toHaveURL('/');
  });

  test('[P1] should configure health reminders when completing step 1', async ({ page, seedPet }) => {
    await seedPet({ name: `HealthPet-${Date.now()}` });
    await page.goto('/onboarding');

    // Step 1: Health Reminders - checkboxes are on by default, toggle them
    await expect(page.getByTestId('wizard-health')).toBeVisible();
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Verify we moved to step 2
    await expect(page.getByTestId('wizard-weight')).toBeVisible();
    await expect(page.getByText('Poids actuel')).toBeVisible();
  });

  test('[P1] should accept weight input in step 2', async ({ page, seedPet }) => {
    await seedPet({ name: `WeighPet-${Date.now()}` });
    await page.goto('/onboarding');

    // Skip step 1
    await expect(page.getByTestId('wizard-health')).toBeVisible();
    await page.getByRole('button', { name: 'Passer' }).click();

    // Step 2: Weight - enter a value
    await expect(page.getByTestId('wizard-weight')).toBeVisible();
    await page.getByTestId('weight-input').fill('4.5');
    await page.getByRole('button', { name: 'Continuer' }).click();

    // Verify we moved to step 3
    await expect(page.getByTestId('wizard-food')).toBeVisible();
    await expect(page.getByText('Alimentation')).toBeVisible();
  });

  test('[P1] should show food step with meal count selection in step 3', async ({ page, seedPet }) => {
    await seedPet({ name: `FoodPet-${Date.now()}` });
    await page.goto('/onboarding');

    // Skip steps 1 and 2 (wait for each transition)
    await expect(page.getByTestId('wizard-health')).toBeVisible();
    await page.getByRole('button', { name: 'Passer' }).click();
    await expect(page.getByTestId('wizard-weight')).toBeVisible();
    await page.getByRole('button', { name: 'Passer' }).click();

    // Step 3: Food - meal count pills visible
    await expect(page.getByTestId('wizard-food')).toBeVisible();
    await expect(page.getByText('Alimentation')).toBeVisible();
    await expect(page.getByText('Repas par jour')).toBeVisible();
    await page.getByRole('button', { name: "C'est parti !" }).click();

    // Should see celebration screen
    await expect(page.getByText('est prêt', { exact: false })).toBeVisible();
  });

  test('[P0] should not show onboarding for returning user', async ({ page, seedPet }) => {
    // onboarding_done is set in localStorage after completing/skipping onboarding wizard
    // (set by the celebration screen's finish() in onboarding/+page.svelte)
    // Since tests run serially and prior tests complete the wizard, onboarding_done is already set.
    await seedPet({ name: `Returning-${Date.now()}` });
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });
});
