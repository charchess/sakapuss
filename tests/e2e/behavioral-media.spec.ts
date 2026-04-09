import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Behavioral Tags UI (ATDD - Story 5.1)', () => {

  let petId: string;

  test.beforeEach(async ({ seedPet }) => {
    const pet = await seedPet({ name: 'TagUICat' });
    petId = pet.id;
  });

  test('[P0] should display behavioral tags on timeline events', async ({ page, request }) => {
    // Seed an event with tags via API
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: new Date().toISOString(),
        payload: { text: 'Observation', tags: ['lethargy', 'scratching'] },
      },
    });

    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    // Tags should be visible in the timeline
    await expect(page.getByTestId('pet-timeline')).toContainText('lethargy');
    await expect(page.getByTestId('pet-timeline')).toContainText('scratching');
  });

  test('[P1] should show tag badges with distinct styling', async ({ page, request }) => {
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'litter',
        occurred_at: new Date().toISOString(),
        payload: { status: 'Normal', tags: ['normal_stool'] },
      },
    });

    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    const tagBadge = page.locator('.tag-badge').first();
    await expect(tagBadge).toBeVisible();
  });

  test('[P1] should display photo gallery section', async ({ page, request }) => {
    // Seed events with photo data (photo_url in payload)
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: new Date().toISOString(),
        payload: { text: 'Wound check', photo_url: '/media/test.jpg' },
      },
    });

    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    // Photo gallery section should exist
    await expect(page.getByTestId('photo-gallery')).toBeVisible();
  });
});
