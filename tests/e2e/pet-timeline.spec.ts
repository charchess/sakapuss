import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Pet Timeline Visualization (ATDD - Story 2.3)', () => {

  let petId: string;

  test.beforeEach(async ({ request, seedPet }) => {
    const pet = await seedPet({ name: 'TimelineViz' });
    petId = pet.id;

    // Seed events of different types
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-01T08:00:00Z',
        payload: { value: 4.0, unit: 'kg' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'vaccine',
        occurred_at: '2026-03-04T10:00:00Z',
        payload: { name: 'Rabies', next_due: '2027-03-04' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: '2026-03-08T14:00:00Z',
        payload: { text: 'Appetite seems lower than usual' },
      },
    });
  });

  test('[P0] should display timeline events on pet profile page', async ({ page }) => {
    await page.goto(`/pets/${petId}`);

    // The timeline section should exist
    const timeline = page.getByTestId('pet-timeline');
    await expect(timeline).toBeVisible();

    // Should show 3 event cards
    const eventCards = timeline.getByTestId('timeline-event');
    await expect(eventCards).toHaveCount(3);
  });

  test('[P0] should show events in chronological order (most recent first)', async ({ page }) => {
    await page.goto(`/pets/${petId}`);

    const eventCards = page.getByTestId('timeline-event');
    await expect(eventCards).toHaveCount(3);

    // First event should be the note (March 8), last should be weight (March 1)
    const firstType = await eventCards.nth(0).getByTestId('event-type').textContent();
    const lastType = await eventCards.nth(2).getByTestId('event-type').textContent();
    expect(firstType?.toLowerCase()).toContain('note');
    expect(lastType?.toLowerCase()).toContain('poids');
  });

  test('[P0] should display distinct icons for each event type', async ({ page }) => {
    await page.goto(`/pets/${petId}`);

    const eventCards = page.getByTestId('timeline-event');
    await expect(eventCards).toHaveCount(3);

    // Each card should have an icon element
    for (let i = 0; i < 3; i++) {
      const icon = eventCards.nth(i).getByTestId('event-icon');
      await expect(icon).toBeVisible();
    }

    // Icons should differ per type (at minimum, they exist and are visible)
    const icons = await Promise.all(
      [0, 1, 2].map(i => eventCards.nth(i).getByTestId('event-icon').textContent())
    );
    // note, vaccine, weight — all different icons
    const uniqueIcons = new Set(icons);
    expect(uniqueIcons.size).toBe(3);
  });

  test('[P1] should show event date and payload summary', async ({ page }) => {
    await page.goto(`/pets/${petId}`);

    const eventCards = page.getByTestId('timeline-event');

    // The note event (first, most recent) should show its text
    const noteCard = eventCards.nth(0);
    await expect(noteCard.getByTestId('event-date')).toBeVisible();
    await expect(noteCard).toContainText('Appetite seems lower than usual');

    // The weight event (last) should show weight value
    const weightCard = eventCards.nth(2);
    await expect(weightCard).toContainText('4');
    await expect(weightCard).toContainText('kg');
  });

  test('[P1] should show empty state when pet has no events', async ({ page, seedPet }) => {
    const emptyPet = await seedPet({ name: 'NouveauChat' });
    await page.goto(`/pets/${emptyPet.id}`);

    const emptyState = page.getByTestId('timeline-empty');
    await expect(emptyState).toBeVisible();
  });
});
