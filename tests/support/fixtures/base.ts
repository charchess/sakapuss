import { test as base } from '@playwright/test';
import { createPet, type Pet } from '../factories';

const API_URL = 'http://localhost:8000';

type SakapussFixtures = {
  seedPet: (overrides?: Partial<Pet>) => Promise<Pet>;
  loginAs: () => Promise<string>; // returns JWT token
};

export const test = base.extend<SakapussFixtures>({
  seedPet: async ({ request }, use) => {
    const createdPetIds: string[] = [];

    const seedPet = async (overrides?: Partial<Pet>) => {
      const petData = createPet(overrides);
      const response = await request.post(`${API_URL}/pets`, {
        data: {
          name: petData.name,
          species: petData.species,
          birth_date: petData.birth_date,
        },
      });
      const created = await response.json();
      createdPetIds.push(created.id);
      return created;
    };

    await use(seedPet);

    // Cleanup: delete created pets
    for (const id of createdPetIds) {
      await request.delete(`${API_URL}/pets/${id}`);
    }
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
