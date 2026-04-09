import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Household Management (ATDD - Stories 6.2, 6.3)', () => {

  test.skip('[P0] should display member list with avatars, roles, and status', async ({ page }) => {
    await page.goto('/settings/household');

    const memberList = page.getByTestId('household-member-list');
    await expect(memberList).toBeVisible();

    // At least the current user should be listed
    const memberCards = memberList.getByTestId('member-card');
    await expect(memberCards.first()).toBeVisible();

    // Each member card has avatar, role, and status
    const firstMember = memberCards.first();
    await expect(firstMember.getByTestId('member-avatar')).toBeVisible();
    await expect(firstMember.getByTestId('member-role')).toBeVisible();
    await expect(firstMember.getByTestId('member-status')).toBeVisible();
  });

  test.skip('[P0] should open invite bottom sheet with email input and profile selector', async ({ page }) => {
    await page.goto('/settings/household');

    await page.getByRole('button', { name: 'Inviter' }).click();

    const bottomSheet = page.getByTestId('invite-bottom-sheet');
    await expect(bottomSheet).toBeVisible();

    // Email input
    await expect(bottomSheet.getByLabel('Email')).toBeVisible();

    // Profile selector with three options
    await expect(bottomSheet.getByRole('radio', { name: 'Total' })).toBeVisible();
    await expect(bottomSheet.getByRole('radio', { name: 'Saisie' })).toBeVisible();
    await expect(bottomSheet.getByRole('radio', { name: 'Consultation' })).toBeVisible();
  });

  test.skip('[P0] should show pending member after submitting invitation', async ({ page }) => {
    await page.goto('/settings/household');

    await page.getByRole('button', { name: 'Inviter' }).click();

    const bottomSheet = page.getByTestId('invite-bottom-sheet');

    await bottomSheet.getByLabel('Email').fill('thomas@example.com');
    await bottomSheet.getByRole('radio', { name: 'Saisie' }).click();
    await bottomSheet.getByRole('button', { name: 'Envoyer' }).click();

    // Bottom sheet closes
    await expect(bottomSheet).not.toBeVisible();

    // Pending member appears in the list
    const memberList = page.getByTestId('household-member-list');
    await expect(memberList).toContainText('thomas@example.com');
    await expect(memberList).toContainText('En attente');
  });

  test.skip('[P1] should show welcome page with role explanation when Thomas opens invitation link', async ({ page, request }) => {
    // Create an invitation via API
    const res = await request.post(`${API_URL}/household/invitations`, {
      data: { email: 'thomas@example.com', role: 'saisie' },
    });
    const invitation = await res.json();

    // Thomas opens the invitation link
    await page.goto(`/invitation/${invitation.token}`);

    // Welcome page
    await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible();

    // Role explanation
    await expect(page.getByTestId('role-explanation')).toBeVisible();
    await expect(page.getByTestId('role-explanation')).toContainText('Saisie');
  });

  test.skip('[P1] should redirect Thomas to dashboard after accepting invitation', async ({ page, request }) => {
    const res = await request.post(`${API_URL}/household/invitations`, {
      data: { email: 'thomas@example.com', role: 'saisie' },
    });
    const invitation = await res.json();

    await page.goto(`/invitation/${invitation.token}`);

    // Accept invitation
    await page.getByRole('button', { name: 'Accepter' }).click();

    // Redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('dashboard')).toBeVisible();
  });
});
