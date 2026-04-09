import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Fast Action Intelligence (ATDD - Stories 4.3 & 4.4)', () => {

  let petId: string;

  test.beforeEach(async ({ seedPet }) => {
    const pet = await seedPet({ name: 'SmartCat' });
    petId = pet.id;
  });

  test('[P0] should auto-save as RAS when save pressed with no selection', async ({ page, request }) => {
    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    // Open litter action, don't select anything, click save
    await page.getByTestId('fast-action-litter').click();
    await page.getByTestId('save-log-btn').click();

    // Wait for modal to close and timeline to update
    await expect(page.getByTestId('decision-tree')).not.toBeVisible();

    // Verify RAS event appears in timeline
    await expect(page.getByTestId('pet-timeline')).toContainText('RAS');
  });

  test('[P1] should save selected symptom as event', async ({ page, request }) => {
    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    // Open litter, select blood, save
    await page.getByTestId('fast-action-litter').click();
    await page.getByTestId('tree-option-blood').click();
    await page.getByTestId('save-log-btn').click();

    // Wait for modal to close
    await expect(page.getByTestId('decision-tree')).not.toBeVisible();

    // Verify event in API
    const eventsRes = await request.get(`${API_URL}/pets/${petId}/events`);
    const events = await eventsRes.json();
    const litterEvent = events.find((e: any) => e.type === 'litter');
    expect(litterEvent).toBeTruthy();
    expect(litterEvent.payload.anomalies).toContain('blood');
  });

  test('[P1] should save food consumption data', async ({ page, request }) => {
    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    // Open food action
    await page.getByTestId('fast-action-food').click();

    // Select food options
    await page.getByTestId('tree-option-normal-appetite').click();
    await page.getByTestId('save-log-btn').click();

    await expect(page.getByTestId('decision-tree')).not.toBeVisible();

    // Verify food event created
    const eventsRes = await request.get(`${API_URL}/pets/${petId}/events`);
    const events = await eventsRes.json();
    const foodEvent = events.find((e: any) => e.type === 'food');
    expect(foodEvent).toBeTruthy();
  });

  test('[P0] should save weight from weight input', async ({ page, request }) => {
    await page.goto(`/pets/${petId}`, { waitUntil: 'networkidle' });

    await page.getByTestId('fast-action-weight').click();
    await page.getByTestId('weight-input').fill('4.5');
    await page.getByTestId('save-log-btn').click();

    await expect(page.getByTestId('decision-tree')).not.toBeVisible();

    // Verify weight event
    const eventsRes = await request.get(`${API_URL}/pets/${petId}/events`);
    const events = await eventsRes.json();
    const weightEvent = events.find((e: any) => e.type === 'weight');
    expect(weightEvent).toBeTruthy();
    expect(weightEvent.payload.value).toBe(4.5);
  });
});
