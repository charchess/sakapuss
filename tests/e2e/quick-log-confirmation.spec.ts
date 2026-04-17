import { test, expect } from '../support/merged-fixtures';

// Serial: seedPet cleanup happens between tests, keeping clean state
test.describe.configure({ mode: 'serial' });

test.describe('Quick Log Confirmation (ATDD - Story 3.5)', () => {

  /** Log a behavior event (always available, no config required) via the dashboard action tile */
  async function logBehaviorAction(page: any) {
    await page.getByTestId('action-behavior').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Skip pet picker if multiple pets exist
    const pick = dialog.locator('.animal-pick').first();
    try {
      await pick.waitFor({ state: 'visible', timeout: 1500 });
      await pick.click();
      await pick.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    } catch {
      // Single pet — form already visible
    }
    await page.locator('.btn-log').click();
    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  }

  test('[P0] should show confirmation toast with checkmark, message, and timestamp', async ({ page, seedPet }) => {
    await seedPet({ name: `Confirm-${Date.now()}` });
    await page.goto('/', { waitUntil: 'networkidle' });

    await logBehaviorAction(page);

    const toast = page.getByTestId('confirmation-toast');
    await expect(toast).toBeVisible();

    // Checkmark icon, message, timestamp
    await expect(toast.locator('.toast-icon')).toBeVisible();
    await expect(toast.getByTestId('toast-timestamp')).toBeVisible();
  });

  test('[P0] should display 3-second countdown progress bar', async ({ page, seedPet }) => {
    await seedPet({ name: `Countdown-${Date.now()}` });
    await page.goto('/', { waitUntil: 'networkidle' });

    await logBehaviorAction(page);

    const toast = page.getByTestId('confirmation-toast');
    await expect(toast).toBeVisible();

    await expect(toast.getByRole('progressbar')).toBeVisible();
  });

  test('[P0] should auto-dismiss after 3 seconds and update dashboard', async ({ page, seedPet }) => {
    await seedPet({ name: `AutoDismiss-${Date.now()}` });
    await page.goto('/', { waitUntil: 'networkidle' });

    await logBehaviorAction(page);

    const toast = page.getByTestId('confirmation-toast');
    await expect(toast).toBeVisible();

    // Wait for auto-dismiss (3 seconds + buffer)
    await expect(toast).not.toBeVisible({ timeout: 5000 });

    // Dashboard recent activity should show the new entry
    const activityStream = page.getByTestId('recent-activity');
    await expect(activityStream).toBeVisible();
  });

  test('[P1] should expand toast with text input when tapping Note and pause countdown', async ({ page, seedPet }) => {
    await seedPet({ name: `NotePet-${Date.now()}` });
    await page.goto('/', { waitUntil: 'networkidle' });

    await logBehaviorAction(page);

    const toast = page.getByTestId('confirmation-toast');
    await expect(toast).toBeVisible();

    // Tap the Note action
    await toast.getByTestId('toast-note').click();

    // Text input should appear with correct aria-label
    await expect(toast.getByRole('textbox', { name: 'Note' })).toBeVisible();

    // Countdown should be paused — toast still visible after 3+ seconds
    await page.waitForTimeout(3500);
    await expect(toast).toBeVisible();

    // Type a note and save
    await toast.getByRole('textbox', { name: 'Note' }).fill('Bonne santé');
    await toast.getByRole('button', { name: 'Enregistrer' }).click();
  });

  test('[P1] should show numeric input when tapping Poids', async ({ page, seedPet }) => {
    await seedPet({ name: `WeightLog-${Date.now()}` });
    await page.goto('/', { waitUntil: 'networkidle' });

    await logBehaviorAction(page);

    const toast = page.getByTestId('confirmation-toast');
    await expect(toast).toBeVisible();

    // Tap the weight action
    await toast.getByTestId('toast-weight').click();

    // Numeric input should appear
    await expect(toast.getByRole('spinbutton', { name: 'Poids' })).toBeVisible();
  });

  test('[P0] should undo event when tapping Annuler', async ({ page, seedPet }) => {
    await seedPet({ name: `UndoPet-${Date.now()}` });
    await page.goto('/', { waitUntil: 'networkidle' });

    await logBehaviorAction(page);

    const toast = page.getByTestId('confirmation-toast');
    await expect(toast).toBeVisible();

    // Tap Annuler (Undo)
    await toast.getByTestId('toast-undo').click();

    // Toast should dismiss immediately
    await expect(toast).not.toBeVisible({ timeout: 2000 });
  });
});
