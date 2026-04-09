import { test, expect } from '../support/fixtures/base';

test.describe('Pet Onboarding', () => {
  test('should allow user to view their pets on the dashboard', async ({ page, seedPet }) => {
    // Given: Multiple pets exist in the database
    const pet1 = await seedPet({ name: 'Vanille' });
    const pet2 = await seedPet({ name: 'Praline' });

    // When: I access the dashboard
    await page.goto('/');

    // Then: I should see both pets listed
    await expect(page.getByText(pet1.name)).toBeVisible();
    await expect(page.getByText(pet2.name)).toBeVisible();
  });
});
