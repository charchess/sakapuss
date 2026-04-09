import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('MQTT Bridge & HA Discovery (ATDD - Story 3.2)', () => {

  test('[P0] should report MQTT health status', async ({ request }) => {
    const response = await request.get(`${API_URL}/health/mqtt`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    // MQTT should report its status (enabled/disabled based on config)
    expect(body).toHaveProperty('enabled');
    expect(body).toHaveProperty('connected');
    expect(body).toHaveProperty('discovery_published');
    // In test environment, broker is not configured so enabled=false
    expect(typeof body.enabled).toBe('boolean');
  });

  test('[P1] should gracefully handle no MQTT broker configured', async ({ request }) => {
    const response = await request.get(`${API_URL}/health/mqtt`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    // Without MQTT_BROKER_HOST env, bridge should be disabled
    expect(body.enabled).toBe(false);
    expect(body.connected).toBe(false);
    expect(body.discovery_published).toBe(false);
  });

  test('[P1] should have MQTT health endpoint accessible alongside other health endpoints', async ({ request }) => {
    // Verify all health endpoints work
    const [rootRes, dbRes, migrationsRes, mqttRes] = await Promise.all([
      request.get(`${API_URL}/`),
      request.get(`${API_URL}/health/db`),
      request.get(`${API_URL}/health/migrations`),
      request.get(`${API_URL}/health/mqtt`),
    ]);

    expect(rootRes.ok()).toBeTruthy();
    expect(dbRes.ok()).toBeTruthy();
    expect(migrationsRes.ok()).toBeTruthy();
    expect(mqttRes.ok()).toBeTruthy();
  });
});
