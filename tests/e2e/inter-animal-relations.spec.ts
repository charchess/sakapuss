import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Inter-Animal Relations (ATDD - Story 9.2)', () => {

  test('[P0] should create a relation event between two pets', async ({ page, seedPet }) => {
    const cat1 = await seedPet({ name: 'Vanille' });
    const cat2 = await seedPet({ name: 'Mina' });

    await page.goto(`/pets/${cat1.id}`, { waitUntil: 'networkidle' });

    await page.getByTestId('add-event-btn').click();
    await expect(page.getByTestId('event-form')).toBeVisible();
    await page.getByTestId('event-type').selectOption('relation');
    await page.getByTestId('event-date').fill('2026-03-09T16:00');
    // Wait for conditional relation fields to render
    await expect(page.getByTestId('event-relation-verb')).toBeVisible();
    await page.getByTestId('event-relation-verb').selectOption('fights_with');
    await page.getByTestId('event-relation-object').selectOption(cat2.id);
    await page.getByTestId('event-payload-text').fill('Bagarre pour la gamelle');
    await page.getByTestId('event-submit').click();

    await expect(page.getByText('Bagarre pour la gamelle')).toBeVisible();
  });

  test('[P0] should show relation event in object pet timeline too', async ({ request, seedPet, page, authHeaders }) => {
    const cat1 = await seedPet({ name: 'RelCat1' });
    const cat2 = await seedPet({ name: 'RelCat2' });

    // Create relation event via API (on cat1)
    await request.post(`${API_URL}/pets/${cat1.id}/events`, {
      data: {
        type: 'relation',
        occurred_at: '2026-03-09T16:00:00',
        payload: {
          subject_pet_id: cat1.id,
          verb: 'plays_with',
          object_pet_id: cat2.id,
          text: 'Playing together',
        },
      },
      headers: authHeaders,
    });

    // Also create on cat2's timeline
    await request.post(`${API_URL}/pets/${cat2.id}/events`, {
      data: {
        type: 'relation',
        occurred_at: '2026-03-09T16:00:00',
        payload: {
          subject_pet_id: cat1.id,
          verb: 'plays_with',
          object_pet_id: cat2.id,
          text: 'Playing together',
        },
      },
      headers: authHeaders,
    });

    // Verify on cat2's timeline
    await page.goto(`/pets/${cat2.id}`, { waitUntil: 'networkidle' });
    await expect(page.getByText('Playing together')).toBeVisible();
  });
});
