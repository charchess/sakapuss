import { test, expect } from '../support/merged-fixtures';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Household Members & Invitations (ATDD - Story 6.1)', () => {

  let householdId: string;

  test.beforeEach(async ({ request }) => {
    // Create a household to use in tests
    const res = await request.post(`${API_URL}/households`, {
      data: { name: 'Test Family' },
    });
    expect(res.ok()).toBeTruthy();
    const household = await res.json();
    householdId = household.id;
  });

  test.afterEach(async ({ request }) => {
    if (householdId) {
      await request.delete(`${API_URL}/households/${householdId}`);
    }
  });

  test('[P0] should invite a member with admin role', async ({ request }) => {
    const response = await request.post(`${API_URL}/households/${householdId}/invitations`, {
      data: { email: 'admin-invite@example.com', role: 'admin' },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.email).toBe('admin-invite@example.com');
    expect(body.role).toBe('admin');
    expect(body.status).toBe('pending');
    expect(body.token).toBeDefined();
  });

  test('[P0] should invite a member with input role', async ({ request }) => {
    const response = await request.post(`${API_URL}/households/${householdId}/invitations`, {
      data: { email: 'input-user@example.com', role: 'input' },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.role).toBe('input');
  });

  test('[P0] should invite a member with readonly role', async ({ request }) => {
    const response = await request.post(`${API_URL}/households/${householdId}/invitations`, {
      data: { email: 'readonly-user@example.com', role: 'readonly' },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.role).toBe('readonly');
  });

  test('[P0] should accept an invitation and link user', async ({ request }) => {
    // Create invitation
    const inviteRes = await request.post(`${API_URL}/households/${householdId}/invitations`, {
      data: { email: 'joiner@example.com', role: 'input' },
    });
    const invite = await inviteRes.json();

    // Accept invitation
    const acceptRes = await request.post(`${API_URL}/invitations/${invite.token}/accept`, {
      data: { user_id: 'new-user-uuid' },
    });

    expect(acceptRes.status()).toBe(200);
    const body = await acceptRes.json();
    expect(body.status).toBe('active');
    expect(body.household_id).toBe(householdId);
    expect(body.user_id).toBe('new-user-uuid');
  });

  test('[P0] should list household members with roles and status', async ({ request }) => {
    // Invite a member first
    await request.post(`${API_URL}/households/${householdId}/invitations`, {
      data: { email: 'listed-member@example.com', role: 'admin' },
    });

    const response = await request.get(`${API_URL}/households/${householdId}/members`);

    expect(response.status()).toBe(200);
    const members = await response.json();
    expect(Array.isArray(members)).toBe(true);
    expect(members.length).toBeGreaterThanOrEqual(1);

    const member = members.find((m: any) => m.email === 'listed-member@example.com');
    expect(member).toBeTruthy();
    expect(member.role).toBe('admin');
    expect(member.status).toBeDefined();
  });

  test('[P0] should revoke member access', async ({ request }) => {
    // Invite and accept
    const inviteRes = await request.post(`${API_URL}/households/${householdId}/invitations`, {
      data: { email: 'revoke-me@example.com', role: 'input' },
    });
    const invite = await inviteRes.json();
    const acceptRes = await request.post(`${API_URL}/invitations/${invite.token}/accept`, {
      data: { user_id: 'revoke-user-uuid' },
    });
    const accepted = await acceptRes.json();

    // Revoke access
    const deleteRes = await request.delete(
      `${API_URL}/households/${householdId}/members/${accepted.member_id}`
    );
    expect(deleteRes.status()).toBe(204);

    // Verify member is gone
    const membersRes = await request.get(`${API_URL}/households/${householdId}/members`);
    const members = await membersRes.json();
    const revoked = members.find((m: any) => m.email === 'revoke-me@example.com');
    expect(revoked).toBeFalsy();
  });

  test('[P1] should reject invitation with invalid role', async ({ request }) => {
    const response = await request.post(`${API_URL}/households/${householdId}/invitations`, {
      data: { email: 'bad-role@example.com', role: 'superadmin' },
    });

    expect(response.status()).toBe(422);
  });

  test('[P1] should return 404 for invalid invitation token', async ({ request }) => {
    const response = await request.post(`${API_URL}/invitations/invalid-token-xyz/accept`, {
      data: { user_id: 'some-user' },
    });

    expect(response.status()).toBe(404);
  });
});

test.describe('Household Role Enforcement (ATDD - Story 6.2)', () => {

  test.skip('[P0] input role cannot create reminders (403) — needs auth middleware', async ({ request }) => {
    // Setup: create household, invite user with input role, create pet
    // Authenticate as input-role user
    const petId = 'seed-pet-id';

    const response = await request.post(`${API_URL}/pets/${petId}/reminders`, {
      data: {
        name: 'Flea treatment',
        type: 'treatment',
        next_due_date: '2026-05-01',
      },
      headers: { 'X-User-Role': 'input' },
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.detail).toContain('permission');
  });

  test.skip('[P0] readonly role cannot create events (403) — needs auth middleware', async ({ request }) => {
    // Setup: create household, invite user with readonly role, create pet
    // Authenticate as readonly-role user
    const petId = 'seed-pet-id';

    const response = await request.post(`${API_URL}/pets/${petId}/events`, {
      data: {
        type: 'weight',
        occurred_at: '2026-04-01T10:00:00Z',
        payload: { value: 5.0, unit: 'kg' },
      },
      headers: { 'X-User-Role': 'readonly' },
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.detail).toContain('permission');
  });
});
