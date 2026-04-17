import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Role-Based Dashboard (ATDD - Story 6.4)', () => {
  test('[P0] should show reduced 2x2 action grid for Saisie role', async ({ page, request }) => {
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'saisie-user@example.com', password: 'testpass123' },
    });
    const { access_token, user } = await loginRes.json();

    // Saisie user has no pets by default — create one so the action grid renders
    const petRes = await request.post(`${API_URL}/pets`, {
      data: { name: `SaisiePet-${Date.now()}`, species: 'Cat', birth_date: '2020-01-01' },
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const pet = await petRes.json();

    try {
      await page.addInitScript(({ token, userData }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('onboarding_done', 'true');
      }, { token: access_token, userData: user });

      await page.goto('/', { waitUntil: 'networkidle' });

      const actionGrid = page.getByTestId('action-grid');
      await expect(actionGrid).toBeVisible();

      // Should have exactly 4 action buttons (2x2)
      const actionButtons = actionGrid.getByRole('button');
      await expect(actionButtons).toHaveCount(4);
    } finally {
      await request.delete(`${API_URL}/pets/${pet.id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      }).catch(() => null);
    }
  });

  test('[P0] should not show Reminders tab in bottom nav for Saisie role', async ({ page, request }) => {
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'saisie-user@example.com', password: 'testpass123' },
    });
    const { access_token, user } = await loginRes.json();

    await page.addInitScript(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('onboarding_done', 'true');
    }, { token: access_token, userData: user });

    await page.goto('/', { waitUntil: 'networkidle' });

    const bottomNav = page.getByTestId('bottom-nav');
    await expect(bottomNav).toBeVisible();

    // Reminders tab should NOT be present
    await expect(bottomNav.getByRole('link', { name: 'Rappels' })).not.toBeVisible();
  });

  test('[P0] should show read-only view for Consultation role (no action grid, no + button)', async ({ page, request }) => {
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'consultation-user@example.com', password: 'testpass123' },
    });
    const { access_token, user } = await loginRes.json();

    await page.addInitScript(({ token, userData }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('onboarding_done', 'true');
    }, { token: access_token, userData: user });

    await page.goto('/', { waitUntil: 'networkidle' });

    // No action grid
    await expect(page.getByTestId('action-grid')).not.toBeVisible();

    // No floating "+" button
    await expect(page.getByTestId('fab-add-button')).not.toBeVisible();
  });

  test.skip('[P1] should show author name on events created by other household members', async ({ page, seedPet, request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: 'main-user@example.com', password: 'testpass123' },
    });

    const pet = await seedPet({ name: `SharedCat-${Date.now()}` });

    await request.post(`${API_URL}/pets/${pet.id}/events`, {
      data: {
        type: 'note',
        occurred_at: '2026-04-08T10:00:00Z',
        payload: { text: 'Mange bien' },
        author: 'Thomas',
      },
    });

    await page.goto(`/pets/${pet.id}/timeline`);

    const eventCard = page.getByTestId('timeline-event').first();
    await expect(eventCard).toContainText('Thomas');
  });
});
