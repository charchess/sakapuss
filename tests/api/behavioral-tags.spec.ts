import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Behavioral Tags API (ATDD - Story 5.1)', () => {

  let petId: string;

  test.beforeEach(async ({ seedPet }) => {
    const pet = await seedPet({ name: 'TagCat' });
    petId = pet.id;
  });

  test('[P0] should store behavioral tags when creating an event', async ({ request }) => {
    const res = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'note',
        occurred_at: new Date().toISOString(),
        payload: {
          text: 'Seems tired today',
          tags: ['lethargy', 'low_appetite'],
        },
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.payload.tags).toContain('lethargy');
    expect(body.payload.tags).toContain('low_appetite');
  });

  test('[P0] should return tags in timeline events', async ({ request }) => {
    // Create event with tags
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'litter',
        occurred_at: new Date().toISOString(),
        payload: { status: 'Normal', tags: ['normal_stool'] },
      },
    });

    // Fetch events
    const res = await request.get(`${API_URL}/pets/${petId}/events`);
    expect(res.ok()).toBeTruthy();
    const events = await res.json();
    const tagged = events.find((e: any) => e.payload.tags?.includes('normal_stool'));
    expect(tagged).toBeTruthy();
  });

  test('[P1] should return predefined tag list', async ({ request }) => {
    const res = await request.get(`${API_URL}/tags`);
    expect(res.ok()).toBeTruthy();
    const tags = await res.json();
    expect(tags).toBeInstanceOf(Array);
    expect(tags.length).toBeGreaterThan(0);
    // Should include known tags
    expect(tags.some((t: any) => t.id === 'lethargy')).toBeTruthy();
  });
});
