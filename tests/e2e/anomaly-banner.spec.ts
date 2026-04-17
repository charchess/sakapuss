import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Anomaly Banner on Timeline (ATDD - Story 5.4)', () => {

  test('[P0] should display anomaly banner when weight decline is detected', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `DeclineCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-01-15T10:00:00Z', payload: { value: 5.0, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-02-15T10:00:00Z', payload: { value: 4.5, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-15T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${pet.id}/timeline`, { waitUntil: 'networkidle' });

    const banner = page.getByTestId('anomaly-banner');
    await expect(banner).toBeVisible();
  });

  test('[P0] should show correct text: "{animal} a perdu {amount} en {duration}"', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `TextCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-01-15T10:00:00Z', payload: { value: 5.0, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-15T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${pet.id}/timeline`, { waitUntil: 'networkidle' });

    const banner = page.getByTestId('anomaly-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(pet.name);
    await expect(banner).toContainText('a perdu');
    await expect(banner).toContainText('1 kg');
    await expect(banner).toContainText('2 mois');
  });

  test('[P1] should navigate to weight chart when tapping the banner', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `NavBannerCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-01-15T10:00:00Z', payload: { value: 5.0, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-15T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${pet.id}/timeline`, { waitUntil: 'networkidle' });

    await page.getByTestId('anomaly-banner').getByRole('link').click();

    await expect(page).toHaveURL(new RegExp(`/pets/${pet.id}/weight`));
    await expect(page.getByTestId('weight-chart')).toBeVisible();
  });

  test('[P1] should dismiss banner and not show it again', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `DismissCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-01-15T10:00:00Z', payload: { value: 5.0, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: '2026-03-15T10:00:00Z', payload: { value: 4.0, unit: 'kg' } },
      headers: authHeaders,
    });

    await page.goto(`/pets/${pet.id}/timeline`, { waitUntil: 'networkidle' });

    const banner = page.getByTestId('anomaly-banner');
    await expect(banner).toBeVisible();

    await banner.getByRole('button', { name: 'Fermer' }).click();

    await expect(banner).not.toBeVisible();
  });
});
