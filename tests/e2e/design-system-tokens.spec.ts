import { test, expect } from '../support/merged-fixtures';

test.describe('WDS Design System Tokens (ATDD - Story 1.4)', () => {

  test('[P0] should load with correct background color (#F8F6FF)', async ({ page }) => {
    await page.goto('/');
    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    // #F8F6FF = rgb(248, 246, 255)
    expect(bgColor).toBe('rgb(248, 246, 255)');
  });

  test('[P0] should load Inter font family', async ({ page }) => {
    await page.goto('/');
    const fontFamily = await page.evaluate(() =>
      getComputedStyle(document.body).fontFamily
    );
    expect(fontFamily).toContain('Inter');
  });

  test('[P0] should have Nunito for headings', async ({ page, seedPet }) => {
    await seedPet({ name: 'TokenTest', species: 'cat' });
    await page.goto('/');
    // Wait for any heading to appear
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    const fontFamily = await heading.evaluate((el) =>
      getComputedStyle(el).fontFamily
    );
    expect(fontFamily).toContain('Nunito');
  });

  test('[P1] should define primary color CSS variable', async ({ page }) => {
    await page.goto('/');
    const primaryColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
    );
    expect(primaryColor).toBe('#6C5CE7');
  });

  test('[P1] should define spacing scale CSS variables', async ({ page }) => {
    await page.goto('/');
    const spaceLg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--space-lg').trim()
    );
    expect(spaceLg).toBe('16px');
  });

});
