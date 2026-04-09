import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Bowls Management UI (ATDD - Stories 8.1, 8.2, 8.3)', () => {

  test('[P0] should create a food bowl via UI', async ({ page }) => {
    await page.goto('/bowls', { waitUntil: 'networkidle' });

    await page.getByTestId('add-bowl-btn').click();
    await page.getByTestId('bowl-name').fill('Salon A');
    await page.getByTestId('bowl-location').fill('Salon');
    await page.getByTestId('bowl-type').selectOption('food');
    await page.getByTestId('bowl-capacity').fill('200');
    await page.getByTestId('bowl-submit').click();

    await expect(page.getByText('Salon A')).toBeVisible();
  });

  test('[P0] should fill a bowl and show serving', async ({ request, page, seedPet }) => {
    // Create bowl via API
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: { name: 'FillBowl', location: 'Cuisine', bowl_type: 'food' },
    });
    const bowl = await bowlRes.json();
    const pet = await seedPet({ name: 'FillCat' });

    await page.goto('/bowls', { waitUntil: 'networkidle' });

    // Click fill on the bowl
    await page.getByTestId(`fill-bowl-${bowl.id}`).click();
    await page.getByTestId('serving-amount').fill('50');
    await page.getByTestId('serving-submit').click();

    // Serving count should show
    await expect(page.getByTestId(`bowl-servings-${bowl.id}`)).toContainText('1');
  });

  test('[P0] should show bowls link from dashboard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const bowlsLink = page.getByTestId('bowls-link');
    await expect(bowlsLink).toBeVisible();
    await bowlsLink.click();
    await page.waitForURL('/bowls', { timeout: 5000 });
  });

  test('[P0] should create a water bowl', async ({ page }) => {
    await page.goto('/bowls', { waitUntil: 'networkidle' });

    await page.getByTestId('add-bowl-btn').click();
    await page.getByTestId('bowl-name').fill('Fontaine');
    await page.getByTestId('bowl-location').fill('Cuisine');
    await page.getByTestId('bowl-type').selectOption('water');
    await page.getByTestId('bowl-capacity').fill('500');
    await page.getByTestId('bowl-submit').click();

    await expect(page.getByText('Fontaine')).toBeVisible();
  });
});
