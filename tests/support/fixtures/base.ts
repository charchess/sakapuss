import { test as base } from '@playwright/test';
import { createPet, type Pet } from '../factories';
import * as fs from 'node:fs';
import * as path from 'node:path';

const API_URL = 'http://localhost:8000';
const AUTH_FILE = path.join(__dirname, '../../.auth/test-user.json');

/** Read the JWT token from the storageState file saved by globalSetup */
function getStoredToken(): string | null {
  try {
    const state = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const origin = state.origins?.find((o: { origin: string }) => o.origin === 'http://localhost:5173');
    const entry = origin?.localStorage?.find((e: { name: string }) => e.name === 'token');
    return entry?.value ?? null;
  } catch {
    return null;
  }
}

type SakapussFixtures = {
  seedPet: (overrides?: Partial<Pet>) => Promise<Pet>;
  loginAs: () => Promise<string>; // returns JWT token
  authHeaders: Record<string, string>;
};

export const test = base.extend<SakapussFixtures>({
  seedPet: async ({ request }, use) => {
    const createdPetIds: string[] = [];
    const token = getStoredToken();
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const seedPet = async (overrides?: Partial<Pet>) => {
      const petData = createPet(overrides);
      const response = await request.post(`${API_URL}/pets`, {
        data: {
          name: petData.name,
          species: petData.species,
          birth_date: petData.birth_date,
        },
        headers: authHeaders,
      });
      const created = await response.json();
      createdPetIds.push(created.id);
      return created;
    };

    await use(seedPet);

    // Cleanup: delete created pets
    for (const id of createdPetIds) {
      await request.delete(`${API_URL}/pets/${id}`, { headers: authHeaders });
    }
  },

  authHeaders: async ({}, use) => {
    const token = getStoredToken();
    await use(token ? { Authorization: `Bearer ${token}` } : {});
  },

  loginAs: async ({ request, page }, use) => {
    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@test.local`;
    const res = await request.post(`${API_URL}/auth/register`, {
      data: { email, password: 'TestPass123!' },
    });
    const { access_token } = await res.json();

    // Inject token into browser localStorage before any navigation
    await page.addInitScript((token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ email: 'test@test.local' }));
    }, access_token);

    const loginAs = async () => access_token;
    await use(loginAs);
  },
});

export { expect } from '@playwright/test';
