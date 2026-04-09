import { test as base } from '@playwright/test';
import { createPet, type Pet } from '../factories';

type SakapussFixtures = {
  seedPet: (overrides?: Partial<Pet>) => Promise<Pet>;
};

export const test = base.extend<SakapussFixtures>({
  seedPet: async ({ request }, use) => {
    const createdPetIds: string[] = [];

    const seedPet = async (overrides?: Partial<Pet>) => {
      const petData = createPet(overrides);
      const response = await request.post('http://localhost:8000/pets', {
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
      await request.delete(`http://localhost:8000/pets/${id}`);
    }
  },
});

export { expect } from '@playwright/test';
