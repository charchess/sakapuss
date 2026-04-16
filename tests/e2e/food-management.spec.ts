import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Food Management UI (ATDD - Stories 7.1 & 7.2)', () => {

  test('[P0] should create a food product via UI', async ({ page }) => {
    await page.goto('/food', { waitUntil: 'networkidle' });

    await page.getByTestId('add-product-btn').click();
    await page.waitForURL('/food/products/new', { timeout: 5000 });

    await page.getByTestId('product-name').fill('Quinoa Caille');
    await page.getByTestId('product-brand').fill('Farmina');
    await page.getByTestId('product-type').fill('kibble');
    await page.getByTestId('product-category').fill('main');
    await page.getByTestId('product-weight').fill('7000');
    await page.getByTestId('product-submit').click();

    await page.waitForURL('/food', { timeout: 5000 });
    await expect(page.getByText('Quinoa Caille').first()).toBeVisible();
  });

  test('[P0] should add a bag and manage its lifecycle', async ({ request, page }) => {
    // Create product via API
    const prodRes = await request.post(`${API_URL}/food/products`, {
      data: { name: 'BagTest Kibble', brand: 'BagBrand', food_type: 'kibble', food_category: 'main', default_bag_weight_g: 5000 },
    });
    const product = await prodRes.json();

    await page.goto('/food', { waitUntil: 'networkidle' });

    // Add a bag
    await page.getByTestId('add-bag-btn').click();
    await page.getByTestId('bag-product').selectOption(product.id);
    await page.getByTestId('bag-weight').fill('5000');
    await page.getByTestId('bag-date').fill('2026-03-01');
    await page.getByTestId('bag-submit').click();

    // Bag should appear with stocked status
    await expect(page.getByTestId('bag-status-stocked').first()).toBeVisible();

    // Open the bag
    await page.getByTestId('bag-open-btn').first().click();
    await expect(page.getByTestId('bag-status-opened').first()).toBeVisible();

    // Deplete the bag
    await page.getByTestId('bag-deplete-btn').first().click();
    await expect(page.getByTestId('bag-status-depleted').first()).toBeVisible();
  });

  test('[P0] should show food link from dashboard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const foodLink = page.getByTestId('food-link');
    await expect(foodLink).toBeVisible();
    await foodLink.click();
    await page.waitForURL('/food', { timeout: 5000 });
  });
});
