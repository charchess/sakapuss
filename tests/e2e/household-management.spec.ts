import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

// Serial: tests share browser context and navigate to /settings/household
test.describe.configure({ mode: 'serial' });

test.describe('Household Management (ATDD - Stories 6.2, 6.3)', () => {

  test('[P0] should display member list with avatars, roles, and status', async ({ page }) => {
    await page.goto('/settings/household', { waitUntil: 'networkidle' });

    const memberList = page.getByTestId('household-member-list');
    await expect(memberList).toBeVisible();

    // Creator is added as admin member — at least one card
    const memberCards = memberList.getByTestId('member-card');
    await expect(memberCards.first()).toBeVisible();

    // Each member card has avatar, role, and status
    const firstMember = memberCards.first();
    await expect(firstMember.getByTestId('member-avatar')).toBeVisible();
    await expect(firstMember.getByTestId('member-role')).toBeVisible();
    await expect(firstMember.getByTestId('member-status')).toBeVisible();
  });

  test('[P0] should open invite form with email input and role selector', async ({ page }) => {
    await page.goto('/settings/household', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: 'Inviter' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Inviter' }).click();

    const inviteForm = page.getByTestId('invite-bottom-sheet');
    await expect(inviteForm).toBeVisible({ timeout: 10000 });

    // Email input (accessible via label)
    await expect(inviteForm.getByLabel('Email')).toBeVisible();

    // Role selector with three options
    await expect(inviteForm.getByRole('radio', { name: 'Total' })).toBeAttached();
    await expect(inviteForm.getByRole('radio', { name: 'Saisie' })).toBeAttached();
    await expect(inviteForm.getByRole('radio', { name: 'Consultation' })).toBeAttached();
  });

  test('[P0] should show pending member after submitting invitation', async ({ page }) => {
    const ts = Date.now();
    await page.goto('/settings/household', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: 'Inviter' }).click();

    const inviteForm = page.getByTestId('invite-bottom-sheet');
    await inviteForm.getByLabel('Email').fill(`invite-${ts}@example.com`);
    await inviteForm.getByRole('radio', { name: 'Saisie' }).click();
    await inviteForm.getByRole('button', { name: 'Envoyer' }).click();

    // Form closes after submission
    await expect(inviteForm).not.toBeVisible();

    // Pending member appears in the list
    const memberList = page.getByTestId('household-member-list');
    await expect(memberList).toContainText(`invite-${ts}@example.com`);
    await expect(memberList).toContainText('En attente');
  });

  test('[P1] should show welcome page with role explanation when invitee opens link', async ({ page, request, authHeaders }) => {
    const hRes = await request.post(`${API_URL}/households`, {
      data: { name: 'Test household' },
      headers: authHeaders,
    });
    const household = await hRes.json();
    const invRes = await request.post(`${API_URL}/households/${household.id}/invitations`, {
      data: { email: 'thomas@example.com', role: 'input' },
      headers: authHeaders,
    });
    const invitation = await invRes.json();

    await page.goto(`/invite?token=${invitation.token}`);
    await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible();
  });

  test('[P1] should redirect invitee to dashboard after accepting invitation', async ({ page, request, authHeaders }) => {
    const hRes = await request.post(`${API_URL}/households`, {
      data: { name: 'Test household' },
      headers: authHeaders,
    });
    const household = await hRes.json();
    const invRes = await request.post(`${API_URL}/households/${household.id}/invitations`, {
      data: { email: 'thomas@example.com', role: 'input' },
      headers: authHeaders,
    });
    const invitation = await invRes.json();

    await page.goto(`/invite?token=${invitation.token}`);
    await page.getByRole('button', { name: 'Accepter' }).click();
    await expect(page).toHaveURL('/');
  });
});
