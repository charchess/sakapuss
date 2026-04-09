import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Photo Gallery & Visuals (ATDD - Story 5.2)', () => {

  let petId: string;

  test.beforeEach(async ({ seedPet }) => {
    const pet = await seedPet({ name: 'PhotoCat' });
    petId = pet.id;
  });

  test('[P0] should display photo grid when events have photo_url', async ({ page, request }) => {
    // Seed events with photos
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: '2026-03-01T10:00:00Z',
        payload: { text: 'Wound day 1', photo_url: '/media/wound1.jpg' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: '2026-03-03T10:00:00Z',
        payload: { text: 'Wound day 3', photo_url: '/media/wound3.jpg' },
      },
    });

    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    const gallery = page.getByTestId('photo-gallery');
    await expect(gallery).toBeVisible();

    // Should show 2 photo thumbnails
    const thumbs = gallery.locator('.photo-thumb');
    await expect(thumbs).toHaveCount(2);
  });

  test('[P1] should not show gallery when no photos exist', async ({ page }) => {
    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    // Gallery section should not be visible
    await expect(page.getByTestId('photo-gallery')).not.toBeVisible();
  });

  test('[P1] should show date on photo thumbnails', async ({ page, request }) => {
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: '2026-03-05T14:00:00Z',
        payload: { text: 'Check', photo_url: '/media/check.jpg' },
      },
    });

    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    const dateLabel = page.locator('.photo-date').first();
    await expect(dateLabel).toBeVisible();
    // Should contain a date string
    await expect(dateLabel).toHaveText(/\d/);
  });
});
