/**
 * Story 11.1 & 11.2 — Tests responsive viewport mobile
 * Ces tests s'exécutent sur le projet mobile-chrome (Pixel 5, 393px).
 * Ils vérifient que les parcours clés sont utilisables sur mobile sans overflow horizontal.
 */
import { test, expect } from '../support/merged-fixtures';

test.describe('Mobile Responsive — Stories 11.1 & 11.2', () => {

  test('[P0] dashboard has no horizontal overflow on mobile', async ({ page, seedPet }) => {
    const ts = Date.now();
    await seedPet({ name: `Mobile-${ts}` });
    await page.goto('/', { waitUntil: 'networkidle' });

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 393;
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('[P0] fast-action grid is usable on mobile (no overflow)', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `MobilePet-${Date.now()}` });
    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });

    const grid = page.getByTestId('fast-action-grid');
    await expect(grid).toBeVisible();

    // Grid must not overflow viewport
    const gridBox = await grid.boundingBox();
    const viewportWidth = page.viewportSize()?.width ?? 393;
    if (gridBox) {
      expect(gridBox.x + gridBox.width).toBeLessThanOrEqual(viewportWidth + 2); // 2px tolerance
    }
  });

  test('[P0] pet creation form is usable on mobile', async ({ page }) => {
    await page.goto('/pets/new', { waitUntil: 'networkidle' });

    // Form inputs should be visible and not overflowing
    const nameInput = page.getByTestId('pet-name');
    await expect(nameInput).toBeVisible();

    const inputBox = await nameInput.boundingBox();
    const viewportWidth = page.viewportSize()?.width ?? 393;
    if (inputBox) {
      expect(inputBox.width).toBeGreaterThan(200); // full-width input
      expect(inputBox.x + inputBox.width).toBeLessThanOrEqual(viewportWidth + 2);
    }
  });

  test('[P0] submit button is tappable on mobile (min 44px height)', async ({ page }) => {
    await page.goto('/pets/new', { waitUntil: 'networkidle' });

    const submitBtn = page.getByTestId('pet-submit');
    await expect(submitBtn).toBeVisible();

    const btnBox = await submitBtn.boundingBox();
    if (btnBox) {
      expect(btnBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('[P0] dashboard pet card tappable on mobile', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `TapTest-${Date.now()}` });
    await page.goto('/', { waitUntil: 'networkidle' });

    const card = page.getByRole('link', { name: new RegExp(pet.name) });
    await expect(card).toBeVisible();
    await card.click();

    await expect(page).toHaveURL(new RegExp(`/pets/${pet.id}`));
  });

  test('[P0] pet profile page loads correctly on mobile', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `ProfileMobile-${Date.now()}` });
    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: pet.name })).toBeVisible();
    await expect(page.getByTestId('fast-action-grid')).toBeVisible();

    // No horizontal overflow
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 393;
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });
});
