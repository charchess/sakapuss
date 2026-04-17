import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Vet Landing Page (ATDD - Story 7.3)', () => {

  test('[P0] should display dossier with pet name and key sections', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `DossierCat-${Date.now()}` });

    // Create a vet share with auth
    const res = await request.post(`${API_URL}/vet-shares`, {
      data: { pet_ids: [pet.id], vet_email: 'dr.vet@clinic.com' },
      headers: authHeaders,
    });
    const share = await res.json();

    // Navigate to dossier (no auth required)
    await page.goto(`/vet/dossier/${share.token}`, { waitUntil: 'networkidle' });

    // Pet identity visible
    await expect(page.getByText(pet.name)).toBeVisible();

    // Key sections exist
    await expect(page.getByTestId('vet-reminders-section')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('vet-timeline-section')).toBeVisible({ timeout: 15000 });
  });

  test('[P1] should display non-blocking portal creation banner', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `BannerCat-${Date.now()}` });

    const res = await request.post(`${API_URL}/vet-shares`, {
      data: { pet_ids: [pet.id], vet_email: 'dr.banner@clinic.com' },
      headers: authHeaders,
    });
    const share = await res.json();

    await page.goto(`/vet/dossier/${share.token}`, { waitUntil: 'networkidle' });

    const portalBanner = page.getByTestId('vet-portal-banner');
    await expect(portalBanner).toBeVisible({ timeout: 15000 });
    await expect(portalBanner).toContainText('portail');
  });

  test('[P1] should display medical disclaimer at bottom', async ({ page, seedPet, request, authHeaders }) => {
    const pet = await seedPet({ name: `DisclaimerCat-${Date.now()}` });

    const res = await request.post(`${API_URL}/vet-shares`, {
      data: { pet_ids: [pet.id], vet_email: 'dr.disclaimer@clinic.com' },
      headers: authHeaders,
    });
    const share = await res.json();

    await page.goto(`/vet/dossier/${share.token}`, { waitUntil: 'networkidle' });

    const disclaimer = page.getByTestId('medical-disclaimer');
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toContainText('informations');
  });

  test('[P0] should show error page for invalid/revoked link', async ({ page }) => {
    await page.goto('/vet/dossier/revoked-invalid-token-12345', { waitUntil: 'networkidle' });

    await expect(page.getByTestId('vet-error-page')).toBeVisible();
    await expect(page.getByTestId('vet-error-page')).toContainText(/lien|partagé|introuvable/i);
  });
});
