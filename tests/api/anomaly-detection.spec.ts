import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Anomaly Detection (ATDD - Story 5.4)', () => {

  let petId: string;

  test.beforeEach(async ({ request }) => {
    const petRes = await request.post(`${API_URL}/pets`, {
      data: { name: 'AnomalyCat', species: 'Cat', birth_date: '2020-01-15' },
    });
    expect(petRes.ok()).toBeTruthy();
    const pet = await petRes.json();
    petId = pet.id;
  });

  test.afterEach(async ({ request }) => {
    if (petId) {
      await request.delete(`${API_URL}/pets/${petId}`);
    }
  });

  test('[P0] should list active anomalies for a pet', async ({ request }) => {
    const response = await request.get(`${API_URL}/pets/${petId}/anomalies`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('[P0] should detect anomaly when weight declines >5% over 2 weeks', async ({ request }) => {
    // Create weight events showing >5% decline over 14 days
    // Starting weight: 5.0 kg
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-20T10:00:00Z',
        payload: { value: 5.0, unit: 'kg' },
      },
    });

    // Intermediate weight: 4.9 kg (4 days later)
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-24T10:00:00Z',
        payload: { value: 4.9, unit: 'kg' },
      },
    });

    // Intermediate weight: 4.8 kg (8 days later)
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-28T10:00:00Z',
        payload: { value: 4.8, unit: 'kg' },
      },
    });

    // Final weight: 4.7 kg (14 days later) — 6% decline
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-04-03T10:00:00Z',
        payload: { value: 4.7, unit: 'kg' },
      },
    });

    // Check for anomalies
    const response = await request.get(`${API_URL}/pets/${petId}/anomalies`);
    expect(response.status()).toBe(200);

    const anomalies = await response.json();
    expect(anomalies.length).toBeGreaterThanOrEqual(1);

    const weightAnomaly = anomalies.find((a: any) => a.type === 'weight_decline');
    expect(weightAnomaly).toBeTruthy();
    expect(weightAnomaly.pet_id).toBe(petId);
    expect(weightAnomaly.dismissed).toBe(false);
    expect(weightAnomaly.details).toBeDefined();
    expect(weightAnomaly.details.start_weight).toBe(5.0);
    expect(weightAnomaly.details.end_weight).toBe(4.7);
    expect(weightAnomaly.details.decline_percent).toBeGreaterThan(5);
  });

  test.skip('[P0] should dismiss an anomaly — needs anomalies table', async ({ request }) => {
    // Create weight events to trigger an anomaly (>5% decline over 2 weeks)
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-20T10:00:00Z',
        payload: { value: 5.0, unit: 'kg' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-04-03T10:00:00Z',
        payload: { value: 4.6, unit: 'kg' },
      },
    });

    // Get the anomaly
    const anomaliesRes = await request.get(`${API_URL}/pets/${petId}/anomalies`);
    const anomalies = await anomaliesRes.json();
    expect(anomalies.length).toBeGreaterThanOrEqual(1);

    const anomalyId = anomalies[0].id;

    // Dismiss it
    const response = await request.patch(`${API_URL}/anomalies/${anomalyId}/dismiss`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(anomalyId);
    expect(body.dismissed).toBe(true);
  });

  test.skip('[P1] should not show dismissed anomaly in active list — needs anomalies table', async ({ request }) => {
    // Create weight events to trigger an anomaly
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-03-20T10:00:00Z',
        payload: { value: 5.0, unit: 'kg' },
      },
    });
    await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-04-03T10:00:00Z',
        payload: { value: 4.6, unit: 'kg' },
      },
    });

    // Get and dismiss the anomaly
    const anomaliesRes = await request.get(`${API_URL}/pets/${petId}/anomalies`);
    const anomalies = await anomaliesRes.json();
    expect(anomalies.length).toBeGreaterThanOrEqual(1);

    const anomalyId = anomalies[0].id;
    await request.patch(`${API_URL}/anomalies/${anomalyId}/dismiss`);

    // Fetch active anomalies again — dismissed should not appear
    const activeRes = await request.get(`${API_URL}/pets/${petId}/anomalies`);
    expect(activeRes.status()).toBe(200);

    const activeAnomalies = await activeRes.json();
    const dismissed = activeAnomalies.find((a: any) => a.id === anomalyId);
    expect(dismissed).toBeFalsy();
  });
});
