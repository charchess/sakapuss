import { test, expect } from '../support/merged-fixtures';

test.describe('Onboarding Flow (ATDD - Story 2.6)', () => {

  test.skip('[P0] should redirect to onboarding after adding first animal', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `Onboard-${Date.now()}` });

    // After first animal creation, user should land on onboarding
    await page.goto('/');
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test.skip('[P0] should display 3 wizard steps: Health Reminders, Weight, Food', async ({ page, seedPet }) => {
    await seedPet({ name: `Wizard-${Date.now()}` });
    await page.goto('/onboarding');

    // Step indicators should show 3 steps
    await expect(page.getByRole('progressbar')).toBeVisible();
    await expect(page.getByText('Health Reminders')).toBeVisible();

    // Verify step navigation exists
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test.skip('[P0] should allow skipping all steps and show celebration screen', async ({ page, seedPet }) => {
    await seedPet({ name: `Skipper-${Date.now()}` });
    await page.goto('/onboarding');

    // Step 1: Health Reminders - skip
    await page.getByRole('button', { name: 'Skip' }).click();

    // Step 2: Weight - skip
    await page.getByRole('button', { name: 'Skip' }).click();

    // Step 3: Food - skip
    await page.getByRole('button', { name: 'Skip' }).click();

    // Should see celebration screen
    await expect(page.getByText('all set', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go to Dashboard' })).toBeVisible();

    // Clicking the button should redirect to dashboard
    await page.getByRole('button', { name: 'Go to Dashboard' }).click();
    await expect(page).toHaveURL('/');
  });

  test.skip('[P1] should configure health reminders when completing step 1', async ({ page, seedPet }) => {
    await seedPet({ name: `HealthPet-${Date.now()}` });
    await page.goto('/onboarding');

    // Step 1: Health Reminders - toggle some reminders on
    await expect(page.getByText('Health Reminders')).toBeVisible();
    await page.getByRole('switch', { name: 'Vaccination' }).click();
    await page.getByRole('switch', { name: 'Deworming' }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Verify we moved to step 2
    await expect(page.getByText('Weight')).toBeVisible();
  });

  test.skip('[P1] should accept weight input in step 2', async ({ page, seedPet }) => {
    await seedPet({ name: `WeighPet-${Date.now()}` });
    await page.goto('/onboarding');

    // Skip step 1
    await page.getByRole('button', { name: 'Skip' }).click();

    // Step 2: Weight - enter a value
    await expect(page.getByText('Weight')).toBeVisible();
    await page.getByLabel('Weight').fill('4.5');
    await page.getByRole('button', { name: 'Next' }).click();

    // Verify we moved to step 3
    await expect(page.getByText('Food')).toBeVisible();
  });

  test.skip('[P1] should allow naming food resource in step 3', async ({ page, seedPet }) => {
    await seedPet({ name: `FoodPet-${Date.now()}` });
    await page.goto('/onboarding');

    // Skip steps 1 and 2
    await page.getByRole('button', { name: 'Skip' }).click();
    await page.getByRole('button', { name: 'Skip' }).click();

    // Step 3: Food - name a food resource
    await expect(page.getByText('Food')).toBeVisible();
    await page.getByLabel('Food name').fill('Royal Canin Indoor');
    await page.getByRole('button', { name: 'Next' }).click();

    // Should see celebration screen
    await expect(page.getByText('all set', { exact: false })).toBeVisible();
  });

  test.skip('[P0] should not show onboarding for returning user', async ({ page, seedPet }) => {
    await seedPet({ name: `Returning-${Date.now()}` });

    // Simulate a user who has already completed onboarding
    // by visiting dashboard directly (onboarding flag already set)
    await page.goto('/');

    // Should stay on dashboard, not redirect to onboarding
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
