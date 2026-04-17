import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

// Serial: share browser context for performance (each test navigates to a fresh pet URL)
test.describe.configure({ mode: 'serial' });

test.describe('Category Filters on Timeline (ATDD - Story 5.2)', () => {

  test('[P0] should display horizontal filter pills row with correct categories', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `FilterCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-01T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${pet.id}/timeline`, { waitUntil: 'networkidle' });

    const filterRow = page.getByTestId('category-filter-row');
    await expect(filterRow).toBeVisible();

    // Verify all pills exist
    await expect(filterRow.getByRole('button', { name: 'Tout' })).toBeVisible();
    await expect(filterRow.getByRole('button', { name: 'Poids' })).toBeVisible();
    await expect(filterRow.getByRole('button', { name: 'Santé' })).toBeVisible();
    await expect(filterRow.getByRole('button', { name: 'Alimentation' })).toBeVisible();
    await expect(filterRow.getByRole('button', { name: 'Litière' })).toBeVisible();
    await expect(filterRow.getByRole('button', { name: 'Comportement' })).toBeVisible();
  });

  test('[P0] should have "Tout" pill active by default', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `DefaultCat-${Date.now()}` });

    await page.goto(`/pets/${pet.id}/timeline`, { waitUntil: 'networkidle' });

    const toutPill = page.getByTestId('category-filter-row').getByRole('button', { name: 'Tout' });
    await expect(toutPill).toHaveAttribute('aria-pressed', 'true');
  });

  test('[P1] should show each pill with its category color', async ({ page, seedPet }) => {
    const pet = await seedPet({ name: `ColorCat-${Date.now()}` });

    await page.goto(`/pets/${pet.id}/timeline`, { waitUntil: 'networkidle' });

    const filterRow = page.getByTestId('category-filter-row');

    // Each pill should have a distinct color via data-category attribute
    await expect(filterRow.getByRole('button', { name: 'Poids' })).toHaveAttribute('data-category', 'weight');
    await expect(filterRow.getByRole('button', { name: 'Santé' })).toHaveAttribute('data-category', 'health');
    await expect(filterRow.getByRole('button', { name: 'Alimentation' })).toHaveAttribute('data-category', 'food');
    await expect(filterRow.getByRole('button', { name: 'Litière' })).toHaveAttribute('data-category', 'litter');
    await expect(filterRow.getByRole('button', { name: 'Comportement' })).toHaveAttribute('data-category', 'behavior');
  });

  test('[P0] should filter timeline to only weight entries when tapping "Poids"', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `WeightFilterCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-01T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'vaccine', occurred_at: '2026-03-05T10:00:00Z', payload: { name: 'Typhus' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'note', occurred_at: '2026-03-08T10:00:00Z', payload: { text: 'Mange bien' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${pet.id}/timeline`, { waitUntil: 'networkidle' });

    // Tap "Poids" filter
    await page.getByTestId('category-filter-row').getByRole('button', { name: 'Poids' }).click();

    // Only weight events should be visible
    const events = page.getByTestId('timeline-event');
    await expect(events).toHaveCount(1);
    await expect(events.first()).toContainText('4');
    await expect(events.first()).toContainText('kg');
  });

  test('[P0] should show all entries again when tapping "Tout" after filtering', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `ResetCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-01T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'vaccine', occurred_at: '2026-03-05T10:00:00Z', payload: { name: 'Typhus' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${pet.id}/timeline`, { waitUntil: 'networkidle' });

    // Filter to Poids
    await page.getByTestId('category-filter-row').getByRole('button', { name: 'Poids' }).click();
    await expect(page.getByTestId('timeline-event')).toHaveCount(1);

    // Reset to Tout
    await page.getByTestId('category-filter-row').getByRole('button', { name: 'Tout' }).click();
    await expect(page.getByTestId('timeline-event')).toHaveCount(2);
  });
});
