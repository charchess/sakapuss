import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Free-form Events (ATDD - Story 9.1)', () => {

  test('[P0] should show add event button on pet profile', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: 'EventCat' });
    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('add-event-btn')).toBeVisible();
  });

  test('[P0] should create a vaccine event via form', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: 'VaccineCat' });
    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });

    await page.getByTestId('add-event-btn').click();
    await expect(page.getByTestId('event-form')).toBeVisible();

    await page.getByTestId('event-type').selectOption('vaccine');
    await page.getByTestId('event-date').fill('2026-03-09T10:00');
    await page.getByTestId('event-payload-name').fill('Rage');
    await page.getByTestId('event-submit').click();

    // Event should appear in timeline
    await expect(page.getByTestId('event-form')).not.toBeVisible();
    await expect(page.getByText('Rage')).toBeVisible();
  });

  test('[P0] should create a note event', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: 'NoteCat' });
    await page.goto(`/pets/${pet.id}`, { waitUntil: 'networkidle' });

    await page.getByTestId('add-event-btn').click();
    await page.getByTestId('event-type').selectOption('note');
    await page.getByTestId('event-date').fill('2026-03-09T14:00');
    await page.getByTestId('event-payload-text').fill('Semble fatigué ce matin');
    await page.getByTestId('event-submit').click();

    await expect(page.getByText('Semble fatigué ce matin')).toBeVisible();
  });
});
