import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Correlation Insights & Vet Summary (ATDD - Stories 5.3 & 5.4)', () => {

  let petId: string;

  test.beforeEach(async ({ seedPet }) => {
    const pet = await seedPet({ name: 'InsightCat' });
    petId = pet.id;
  });

  test('[P0] should show correlation insight card on pet profile', async ({ page, request, authHeaders }) => {
    // Seed food change + symptom within 72h
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'food',
        occurred_at: '2026-03-01T10:00:00Z',
        payload: { brand: 'New Brand', change: true },
      },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'litter',
        occurred_at: '2026-03-02T10:00:00Z',
        payload: { anomalies: ['diarrhea'] },
      },
      headers: authHeaders,
    });

    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    // Insight card should be visible
    const insight = page.getByTestId('correlation-insight');
    await expect(insight).toBeVisible();
    await expect(insight).toContainText(/corrélation|correlation/i);
  });

  test('[P1] should not show insight card when no correlations', async ({ page }) => {
    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });
    await expect(page.getByTestId('correlation-insight')).not.toBeVisible();
  });

  test('[P0] should show vet summary section with recent history', async ({ page, request, authHeaders }) => {
    // Seed some events for the pet
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: new Date().toISOString(),
        payload: { value: 4.2, unit: 'kg' },
      },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: new Date().toISOString(),
        payload: { name: 'Rage' },
      },
      headers: authHeaders,
    });

    await page.goto(`/pets/${petId}/vet`, { waitUntil: 'networkidle' });

    // Vet summary section should be visible
    await expect(page.getByTestId('vet-summary')).toBeVisible();
    // Should show recent events
    await expect(page.getByTestId('vet-summary')).toContainText('4.2');
  });

  test('[P0] should display mandatory medical disclaimer on vet summary', async ({ page }) => {
    await page.goto(`/pets/${petId}/vet`, { waitUntil: 'networkidle' });

    const disclaimer = page.getByTestId('medical-disclaimer');
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toContainText(/ne remplace pas|ne constitue pas|avis vétérinaire/i);
  });
});
