import { faker } from '@faker-js/faker';

export type Pet = {
  id: string;
  name: string;
  species: string;
  birth_date: string;
  photo_url?: string;
};

export const createPet = (overrides: Partial<Pet> = {}): Pet => ({
  id: faker.string.uuid(),
  name: faker.person.firstName(),
  species: faker.helpers.arrayElement(['Cat', 'Dog', 'Rabbit']),
  birth_date: faker.date.past({ years: 10 }).toISOString().split('T')[0],
  ...overrides,
});
