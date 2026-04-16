import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Visual Screenshots', () => {
  let petId: string;

  test.beforeAll(async () => {
    try {
      const response = await fetch(`${API_URL}/pets`);
      const pets = await response.json();
      if (pets.length > 0) {
        petId = pets[0].id;
      }
    } catch (e) {
      console.log('Could not fetch pet ID');
    }
  });

  test('dashboard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/screenshots/dashboard.png', fullPage: true });
  });

  test('pets-new', async ({ page }) => {
    await page.goto('/pets/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/screenshots/pets-new.png', fullPage: true });
  });

  test('settings', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/screenshots/settings.png', fullPage: true });
  });

  test('reminders', async ({ page }) => {
    await page.goto('/reminders', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/screenshots/reminders.png', fullPage: true });
  });

  test('food', async ({ page }) => {
    await page.goto('/food', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/screenshots/food.png', fullPage: true });
  });

  test('bowls', async ({ page }) => {
    await page.goto('/bowls', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/screenshots/bowls.png', fullPage: true });
  });

  test('timeline', async ({ page }) => {
    await page.goto('/timeline', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/screenshots/timeline.png', fullPage: true });
  });

  test('onboarding', async ({ page }) => {
    await page.goto('/onboarding', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/screenshots/onboarding.png', fullPage: true });
  });

  test('pet-profile', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `Screenshot-${Date.now()}` });
    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/screenshots/pet-profile.png', fullPage: true });
  });

  test('pet-edit', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `Edit-${Date.now()}` });
    await page.goto(`/pets/${pet.id}/edit`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/screenshots/pet-edit.png', fullPage: true });
  });
});
