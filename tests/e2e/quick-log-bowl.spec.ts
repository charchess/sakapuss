import { test, expect } from '../support/merged-fixtures';

const API = process.env.API_URL || 'http://localhost:8000';

test.describe('Quick Log Bowl Fill', () => {

  test('should activate bowl on tap and enable submit', async ({ page, request }) => {
    // 1. Register + login
    const email = `bowltest-${Date.now()}@test.com`;
    const regRes = await request.post(`${API}/auth/register`, {
      data: { email, password: 'TestPass123!' },
    });
    const { access_token } = await regRes.json();

    // 2. Create pet
    await request.post(`${API}/pets`, {
      data: { name: 'BowlCat', species: 'Cat', birth_date: '2022-01-01' },
    });

    // 3. Create a food product
    const prodRes = await request.post(`${API}/food/products`, {
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      data: { name: 'Croquettes Test', brand: 'TestBrand', food_type: 'croquettes', food_category: 'main' },
    });
    const product = await prodRes.json();

    // 4. Create bowl
    await request.post(`${API}/bowls`, {
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      data: { name: 'Gamelle Test', bowl_type: 'food', capacity_g: 30, location: 'salon', current_product_id: product.id },
    });

    // 5. Set token in browser and go to dashboard
    await page.goto('/login');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, access_token);
    await page.goto('/');
    await page.waitForTimeout(1000);

    // 6. Screenshot dashboard
    await page.screenshot({ path: '/tmp/bowl-dashboard.png' });

    // 7. Check food tile exists
    const foodTile = page.getByTestId('action-food_serve');
    const tileVisible = await foodTile.isVisible().catch(() => false);
    console.log('Food tile visible:', tileVisible);

    if (!tileVisible) {
      // Debug: check what tiles are on page
      const tiles = await page.locator('[data-testid^="action-"]').allTextContents();
      console.log('Available tiles:', tiles);
      // Check if bowls were loaded
      const pageContent = await page.textContent('body');
      console.log('Page has "Gamelle":', pageContent?.includes('Gamelle'));
    }

    await expect(foodTile).toBeVisible({ timeout: 5000 });
    await foodTile.click();
    await page.waitForTimeout(500);

    // 8. Screenshot sheet
    await page.screenshot({ path: '/tmp/bowl-sheet.png' });

    // 9. Check sheet opened
    await expect(page.getByRole('dialog').getByText('Gamelle remplie')).toBeVisible({ timeout: 3000 });

    // Capture browser console
    page.on('console', msg => console.log('BROWSER:', msg.text()));

    // 10. Click first bowl icon
    const bowlBtn = page.locator('.bowl-icon').first();
    await expect(bowlBtn).toBeVisible();

    // Try clicking via JS evaluate to bypass any event issues
    const bowlCount = await page.locator('.bowl-icon').count();
    console.log('Number of bowl icons:', bowlCount);

    // Click the first bowl inside the dialog specifically
    const dialogBowl = page.getByRole('dialog').locator('.bowl-icon').first();
    await expect(dialogBowl).toBeVisible();
    console.log('Dialog bowl text:', await dialogBowl.textContent());

    await dialogBowl.click();
    await page.waitForTimeout(500);

    // 11. Screenshot after click
    await page.screenshot({ path: '/tmp/bowl-clicked.png' });

    // 12. Verify active
    const hasActive = await dialogBowl.evaluate(el => el.classList.contains('active'));
    console.log('Bowl has active class:', hasActive);

    // 13. Verify submit enabled
    const submitBtn = page.locator('.btn-log');
    const submitDisabled = await submitBtn.evaluate(el => (el as HTMLButtonElement).disabled);
    console.log('Submit disabled:', submitDisabled);

    expect(hasActive).toBe(true);
    expect(submitDisabled).toBe(false);
  });
});
