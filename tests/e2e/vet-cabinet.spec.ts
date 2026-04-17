import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

// Serial: tests share dashboard state and need a seeded patient
test.describe.configure({ mode: 'serial' });

test.describe('Vet Cabinet / Dashboard (ATDD - Stories 7.4, 7.5)', () => {
  let sharedPetId = '';

  test.beforeAll(async ({ request, authHeaders }) => {
    // Create a pet with vet share and weight events for alert detection
    const ts = Date.now();
    const petRes = await request.post(`${API_URL}/pets`, {
      data: { name: `VetPatient-${ts}`, species: 'Cat', birth_date: '2020-01-01' },
      headers: authHeaders,
    });
    const pet = await petRes.json();
    sharedPetId = pet.id;

    // Create vet share — use the test user's own email so /vet/patients (auth-filtered) finds it
    await request.post(`${API_URL}/vet-shares`, {
      data: { vet_email: 'playwright-e2e@test.sakapuss.local', pet_ids: [pet.id] },
      headers: authHeaders,
    });

    // Create 3 weight events within last 30 days showing decline (for anomaly detection)
    const now = new Date();
    const d1 = new Date(now); d1.setDate(d1.getDate() - 20);
    const d2 = new Date(now); d2.setDate(d2.getDate() - 12);
    const d3 = new Date(now); d3.setDate(d3.getDate() - 4);

    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: d1.toISOString(), payload: { value: 5.0, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: d2.toISOString(), payload: { value: 4.5, unit: 'kg' } },
      headers: authHeaders,
    });
    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: { type: 'weight', occurred_at: d3.toISOString(), payload: { value: 4.0, unit: 'kg' } },
      headers: authHeaders,
    });
  });

  // Helper: navigate to vet dashboard and wait for data to fully load
  // (networkidle may fire between /vet/patients response and anomaly requests)
  async function gotoVetDashboard(page: any) {
    await page.goto('/vet/dashboard', { waitUntil: 'load' });
    await expect(page.locator('.loading')).not.toBeVisible({ timeout: 30000 });
  }

  test('[P0] should display prominent auto-focused search bar on vet dashboard', async ({ page }) => {
    await gotoVetDashboard(page);

    const searchBar = page.getByRole('searchbox', { name: /rechercher/i });
    await expect(searchBar).toBeVisible();
    await expect(searchBar).toBeFocused();
  });

  test('[P0] should display "Patients with alerts" section', async ({ page }) => {
    await gotoVetDashboard(page);

    const alertsSection = page.getByTestId('patients-with-alerts');
    await expect(alertsSection).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Patients avec alertes' })).toBeVisible();
  });

  test('[P0] should display "Recent patients" cards', async ({ page }) => {
    await gotoVetDashboard(page);

    const recentSection = page.getByTestId('recent-patients');
    await expect(recentSection).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Patients récents' })).toBeVisible();

    const patientCards = recentSection.getByTestId('patient-card');
    await expect(patientCards.first()).toBeVisible();
  });

  test('[P0] should navigate to two-column dossier layout when clicking a patient', async ({ page }) => {
    await gotoVetDashboard(page);

    const firstCard = page.getByTestId('recent-patients').getByTestId('patient-card').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // Verify two-column layout
    await expect(page.getByTestId('vet-dossier-left-column')).toBeVisible();
    await expect(page.getByTestId('vet-dossier-right-column')).toBeVisible();
  });

  test('[P0] should show alert cards at top of vet dossier', async ({ page }) => {
    await gotoVetDashboard(page);

    // Wait for alert patient cards to be rendered, then navigate
    const alertCard = page.getByTestId('patients-with-alerts').getByTestId('patient-card').first();
    await expect(alertCard).toBeVisible();
    await alertCard.click();

    const alertCards = page.getByTestId('vet-alert-card');
    await expect(alertCards.first()).toBeVisible();

    // Alert cards should indicate weight decline or overdue treatment
    const alertTexts = await alertCards.allTextContents();
    const hasRelevantAlert = alertTexts.some(
      text => /perte de poids|poids en baisse|traitement en retard|retard|declined|weight/i.test(text)
    );
    expect(hasRelevantAlert).toBe(true);
  });

  test('[P1] should filter vet dossier timeline to Medical by default', async ({ page }) => {
    await page.goto(`/vet/patients/${sharedPetId}`, { waitUntil: 'networkidle' });

    // Medical filter should be active
    const medicalFilter = page.getByTestId('vet-timeline-filter').getByRole('button', { name: 'Médical' });
    await expect(medicalFilter).toHaveAttribute('aria-pressed', 'true');
  });

  test('[P1] should show "Show all" toggle that includes Activity events', async ({ page }) => {
    await page.goto(`/vet/patients/${sharedPetId}`, { waitUntil: 'networkidle' });

    // Toggle "Show all"
    const showAllToggle = page.getByRole('button', { name: 'Tout afficher' });
    await expect(showAllToggle).toBeVisible();
    await showAllToggle.click();

    // Activity events should now be visible
    await expect(page.getByTestId('vet-timeline').getByTestId('timeline-event')).not.toHaveCount(0);
  });

  test('[P1] should be read-only with no edit controls visible', async ({ page }) => {
    await page.goto(`/vet/patients/${sharedPetId}`, { waitUntil: 'networkidle' });

    // No edit buttons, no FAB, no delete
    await expect(page.getByTestId('fab-add-button')).not.toBeVisible();
    await expect(page.getByRole('button', { name: /modifier|supprimer|éditer/i })).not.toBeVisible();
  });
});
