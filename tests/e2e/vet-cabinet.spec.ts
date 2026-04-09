import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Vet Cabinet / Dashboard (ATDD - Stories 7.4, 7.5)', () => {

  test.skip('[P0] should display prominent auto-focused search bar on vet dashboard', async ({ page, request }) => {
    // Login as vet
    await request.post(`${API_URL}/auth/login`, {
      data: { email: 'dr.martin@vetclinic.com', password: 'vetpass123' },
    });

    await page.goto('/vet/dashboard');

    const searchBar = page.getByRole('searchbox', { name: /rechercher/i });
    await expect(searchBar).toBeVisible();
    await expect(searchBar).toBeFocused();
  });

  test.skip('[P0] should display "Patients with alerts" section', async ({ page, request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: 'dr.martin@vetclinic.com', password: 'vetpass123' },
    });

    await page.goto('/vet/dashboard');

    const alertsSection = page.getByTestId('patients-with-alerts');
    await expect(alertsSection).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Patients avec alertes' })).toBeVisible();
  });

  test.skip('[P0] should display "Recent patients" cards', async ({ page, request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: 'dr.martin@vetclinic.com', password: 'vetpass123' },
    });

    await page.goto('/vet/dashboard');

    const recentSection = page.getByTestId('recent-patients');
    await expect(recentSection).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Patients récents' })).toBeVisible();

    const patientCards = recentSection.getByTestId('patient-card');
    await expect(patientCards.first()).toBeVisible();
  });

  test.skip('[P0] should navigate to two-column dossier layout when clicking a patient', async ({ page, request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: 'dr.martin@vetclinic.com', password: 'vetpass123' },
    });

    await page.goto('/vet/dashboard');

    // Click first patient card
    await page.getByTestId('recent-patients').getByTestId('patient-card').first().click();

    // Verify two-column layout
    await expect(page.getByTestId('vet-dossier-left-column')).toBeVisible();
    await expect(page.getByTestId('vet-dossier-right-column')).toBeVisible();
  });

  test.skip('[P0] should show alert cards at top of vet dossier', async ({ page, request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: 'dr.martin@vetclinic.com', password: 'vetpass123' },
    });

    await page.goto('/vet/dashboard');

    // Navigate to a patient with alerts
    await page.getByTestId('patients-with-alerts').getByTestId('patient-card').first().click();

    const alertCards = page.getByTestId('vet-alert-card');
    await expect(alertCards.first()).toBeVisible();

    // Alert cards should indicate weight decline or overdue treatment
    const alertTexts = await alertCards.allTextContents();
    const hasRelevantAlert = alertTexts.some(
      text => /perte de poids|poids en baisse|traitement en retard|retard/i.test(text)
    );
    expect(hasRelevantAlert).toBe(true);
  });

  test.skip('[P1] should filter vet dossier timeline to Medical by default', async ({ page, request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: 'dr.martin@vetclinic.com', password: 'vetpass123' },
    });

    await page.goto('/vet/dashboard');
    await page.getByTestId('recent-patients').getByTestId('patient-card').first().click();

    // Medical filter should be active
    const medicalFilter = page.getByTestId('vet-timeline-filter').getByRole('button', { name: 'Médical' });
    await expect(medicalFilter).toHaveAttribute('aria-pressed', 'true');
  });

  test.skip('[P1] should show "Show all" toggle that includes Activity events', async ({ page, request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: 'dr.martin@vetclinic.com', password: 'vetpass123' },
    });

    await page.goto('/vet/dashboard');
    await page.getByTestId('recent-patients').getByTestId('patient-card').first().click();

    // Toggle "Show all"
    const showAllToggle = page.getByRole('button', { name: 'Tout afficher' });
    await expect(showAllToggle).toBeVisible();
    await showAllToggle.click();

    // Activity events should now be visible
    await expect(page.getByTestId('vet-timeline').getByTestId('timeline-event')).not.toHaveCount(0);
  });

  test.skip('[P1] should be read-only with no edit controls visible', async ({ page, request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: 'dr.martin@vetclinic.com', password: 'vetpass123' },
    });

    await page.goto('/vet/dashboard');
    await page.getByTestId('recent-patients').getByTestId('patient-card').first().click();

    // No edit buttons, no FAB, no delete
    await expect(page.getByTestId('fab-add-button')).not.toBeVisible();
    await expect(page.getByRole('button', { name: /modifier|supprimer|éditer/i })).not.toBeVisible();
  });
});
