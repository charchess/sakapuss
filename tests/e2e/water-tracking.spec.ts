import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Water Tracking UI (ATDD - Story 8.6)', () => {

  test.skip('[P0] should create a water bowl via UI with capacity field', async ({ page }) => {
    await page.goto('/bowls', { waitUntil: 'networkidle' });

    await page.getByTestId('add-bowl-btn').click();
    await page.getByTestId('bowl-name').fill('Fontaine Cuisine');
    await page.getByTestId('bowl-location').fill('Cuisine');
    await page.getByTestId('bowl-type').selectOption('water');
    await page.getByTestId('bowl-capacity-ml').fill('500');
    await page.getByTestId('bowl-submit').click();

    // Bowl should appear in list with capacity info
    await expect(page.getByText('Fontaine Cuisine')).toBeVisible();
    await expect(page.getByText('500 ml')).toBeVisible();
  });

  test.skip('[P0] should log a water refill with single tap from Quick Log', async ({ page, request }) => {
    // Create water bowl via API
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: {
        name: 'QuickRefillBowl',
        location: 'Salon',
        capacity_ml: 400,
        bowl_type: 'water',
      },
    });
    const bowl = await bowlRes.json();

    await page.goto('/bowls', { waitUntil: 'networkidle' });

    // Quick refill button should be visible on water bowls
    const refillBtn = page.getByTestId(`quick-refill-${bowl.id}`);
    await expect(refillBtn).toBeVisible();
    await refillBtn.click();

    // Confirmation toast should appear
    await expect(page.getByTestId('confirmation-toast')).toBeVisible();
    await expect(page.getByTestId('confirmation-toast')).toContainText('Refill logged');

    // Serving count should update
    await expect(page.getByTestId(`bowl-servings-${bowl.id}`)).toContainText('1');
  });

  test.skip('[P1] should show water consumption history on bowl detail', async ({ page, request }) => {
    // Create water bowl and log refills via API
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: {
        name: 'DetailWaterBowl',
        location: 'Cuisine',
        capacity_ml: 500,
        bowl_type: 'water',
      },
    });
    const bowl = await bowlRes.json();

    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { served_at: '2026-04-08T08:00:00', amount_ml: 500, serving_type: 'water' },
    });
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: { served_at: '2026-04-08T14:00:00', amount_ml: 500, serving_type: 'water', remaining_ml: 100 },
    });

    await page.goto(`/bowls/${bowl.id}`, { waitUntil: 'networkidle' });

    // Water consumption history should be visible
    const history = page.getByTestId('water-history');
    await expect(history).toBeVisible();

    // Should show refill entries
    const entries = history.getByTestId('water-history-entry');
    await expect(entries).toHaveCount(2);

    // Should show consumed volume for the refill with remaining_ml
    await expect(history).toContainText('400 ml consumed');
  });

  test.skip('[P1] should highlight bowls needing refill (>24h since last)', async ({ page, request }) => {
    // Create water bowl and log an old refill via API
    const bowlRes = await request.post(`${API_URL}/bowls`, {
      data: {
        name: 'StaleUIBowl',
        location: 'Salon',
        capacity_ml: 300,
        bowl_type: 'water',
      },
    });
    const bowl = await bowlRes.json();

    // Log refill more than 24h ago
    await request.post(`${API_URL}/bowls/${bowl.id}/fill`, {
      data: {
        served_at: '2026-04-06T08:00:00',
        amount_ml: 300,
        serving_type: 'water',
      },
    });

    await page.goto('/bowls', { waitUntil: 'networkidle' });

    // Bowl card should have attention indicator
    const bowlCard = page.getByTestId(`bowl-card-${bowl.id}`);
    await expect(bowlCard).toBeVisible();
    await expect(bowlCard.getByTestId('needs-refill-badge')).toBeVisible();
    await expect(bowlCard).toHaveClass(/needs-attention/);
  });
});
