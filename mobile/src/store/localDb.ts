import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, PetEvent, Resource, Bowl, Serving, FoodProduct, FoodBag, Reminder } from '../api/client';

const K = {
  pets: 'local:pets',
  events: (petId: string) => `local:events:${petId}`,
  resources: 'local:resources',
  bowls: 'local:bowls',
  products: 'local:products',
  bags: 'local:bags',
  reminders: 'local:reminders',
};

function localId(): string {
  return `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

async function read<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try { return JSON.parse(raw) as T[]; } catch { return []; }
}

async function write<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export const localDb = {
  // ─── Pets ────────────────────────────────────────────────────────
  async getPets(): Promise<Pet[]> {
    return read<Pet>(K.pets);
  },

  async createPet(data: { name: string; species: string; birth_date?: string; breed?: string }): Promise<Pet> {
    const pets = await read<Pet>(K.pets);
    const pet: Pet = { id: localId(), name: data.name, species: data.species, breed: data.breed, birth_date: data.birth_date };
    pets.push(pet);
    await write(K.pets, pets);
    return pet;
  },

  async deletePet(id: string): Promise<void> {
    const pets = await read<Pet>(K.pets);
    await write(K.pets, pets.filter((p) => p.id !== id));
    await AsyncStorage.removeItem(K.events(id));
  },

  // ─── Events ──────────────────────────────────────────────────────
  async getPetEvents(petId: string): Promise<PetEvent[]> {
    return read<PetEvent>(K.events(petId));
  },

  async createPetEvent(petId: string, type: string, payload: Record<string, unknown>): Promise<PetEvent> {
    const events = await read<PetEvent>(K.events(petId));
    const pets = await read<Pet>(K.pets);
    const pet = pets.find((p) => p.id === petId);
    const event: PetEvent = {
      id: localId(),
      pet_id: petId,
      pet_name: pet?.name,
      type,
      occurred_at: new Date().toISOString(),
      payload,
    };
    events.unshift(event);
    await write(K.events(petId), events);
    return event;
  },

  async getAllEvents(limit = 50): Promise<PetEvent[]> {
    const pets = await read<Pet>(K.pets);
    const allArrays = await Promise.all(pets.map((p) => read<PetEvent>(K.events(p.id))));
    const flat = allArrays.flat().sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
    return flat.slice(0, limit);
  },

  // ─── Resources (litières) ─────────────────────────────────────────
  async getResources(type?: string): Promise<Resource[]> {
    const all = await read<Resource>(K.resources);
    return type ? all.filter((r) => r.type === type) : all;
  },

  async createResource(data: { name: string; type: string; color?: string }): Promise<Resource> {
    const all = await read<Resource>(K.resources);
    const now = new Date().toISOString();
    const r: Resource = { id: localId(), name: data.name, type: data.type, color: data.color, enabled: true, created_at: now };
    all.push(r);
    await write(K.resources, all);
    return r;
  },

  async updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
    const all = await read<Resource>(K.resources);
    const updated = all.map((r) => r.id === id ? { ...r, ...data } : r);
    await write(K.resources, updated);
    return updated.find((r) => r.id === id) as Resource;
  },

  async deleteResource(id: string): Promise<void> {
    const all = await read<Resource>(K.resources);
    await write(K.resources, all.filter((r) => r.id !== id));
  },

  // ─── Bowls (gamelles) ─────────────────────────────────────────────
  async getBowls(): Promise<Bowl[]> {
    return read<Bowl>(K.bowls);
  },

  async createBowl(data: { name: string; location: string; bowl_type: 'food' | 'water'; capacity_g?: number }): Promise<Bowl> {
    const all = await read<Bowl>(K.bowls);
    const now = new Date().toISOString();
    const b: Bowl = { id: localId(), name: data.name, location: data.location, bowl_type: data.bowl_type, capacity_g: data.capacity_g, created_at: now, updated_at: now };
    all.push(b);
    await write(K.bowls, all);
    return b;
  },

  async updateBowl(id: string, data: Partial<Bowl>): Promise<Bowl> {
    const all = await read<Bowl>(K.bowls);
    const updated = all.map((b) => b.id === id ? { ...b, ...data } : b);
    await write(K.bowls, updated);
    return updated.find((b) => b.id === id) as Bowl;
  },

  async deleteBowl(id: string): Promise<void> {
    const all = await read<Bowl>(K.bowls);
    await write(K.bowls, all.filter((b) => b.id !== id));
  },

  async fillBowl(id: string, data: { pet_id?: string; amount_g?: number; bag_id?: string }): Promise<Serving> {
    const serving: Serving = {
      id: localId(),
      bowl_id: id,
      bag_id: data.bag_id,
      pet_id: data.pet_id,
      amount_g: data.amount_g,
      served_at: new Date().toISOString(),
    };
    return serving;
  },

  // ─── Food products ────────────────────────────────────────────────
  async getFoodProducts(): Promise<FoodProduct[]> {
    return read<FoodProduct>(K.products);
  },

  async createFoodProduct(data: {
    name: string; brand: string; food_type?: string;
    food_category?: string; default_bag_weight_g?: number;
  }): Promise<FoodProduct> {
    const all = await read<FoodProduct>(K.products);
    const now = new Date().toISOString();
    const p: FoodProduct = { id: localId(), name: data.name, brand: data.brand, food_type: data.food_type ?? 'Croquettes', food_category: data.food_category ?? 'Principal', default_bag_weight_g: data.default_bag_weight_g, created_at: now, updated_at: now };
    all.push(p);
    await write(K.products, all);
    return p;
  },

  async deleteFoodProduct(id: string): Promise<void> {
    const all = await read<FoodProduct>(K.products);
    await write(K.products, all.filter((p) => p.id !== id));
  },

  // ─── Food bags ────────────────────────────────────────────────────
  async getFoodBags(status?: string): Promise<FoodBag[]> {
    const all = await read<FoodBag>(K.bags);
    return status ? all.filter((b) => b.status === status) : all;
  },

  async createFoodBag(data: { product_id: string; weight_g: number; purchased_at?: string }): Promise<FoodBag> {
    const all = await read<FoodBag>(K.bags);
    const now = new Date().toISOString();
    const bag: FoodBag = {
      id: localId(),
      product_id: data.product_id,
      weight_g: data.weight_g,
      status: 'stocked',
      purchased_at: data.purchased_at ?? now.split('T')[0],
      created_at: now,
      updated_at: now,
    };
    all.push(bag);
    await write(K.bags, all);
    return bag;
  },

  async openFoodBag(id: string): Promise<FoodBag> {
    const all = await read<FoodBag>(K.bags);
    const updated = all.map((b) => b.id === id ? { ...b, status: 'opened' as const, opened_at: new Date().toISOString() } : b);
    await write(K.bags, updated);
    return updated.find((b) => b.id === id) as FoodBag;
  },

  async depleteFoodBag(id: string): Promise<FoodBag> {
    const all = await read<FoodBag>(K.bags);
    const updated = all.map((b) => b.id === id ? { ...b, status: 'depleted' as const } : b);
    await write(K.bags, updated);
    return updated.find((b) => b.id === id) as FoodBag;
  },

  // ─── Reminders (basic local) ──────────────────────────────────────
  async getPendingReminders(): Promise<Reminder[]> {
    const all = await read<Reminder>(K.reminders);
    return all.filter((r) => r.status !== 'completed');
  },

  async createReminder(data: Partial<Reminder>): Promise<Reminder> {
    const all = await read<Reminder>(K.reminders);
    const r: Reminder = {
      id: localId(),
      pet_id: data.pet_id ?? '',
      pet_name: data.pet_name ?? '',
      name: data.name ?? '',
      type: data.type ?? 'custom',
      next_due_date: data.next_due_date ?? new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    all.push(r);
    await write(K.reminders, all);
    return r;
  },

  async completeReminder(id: string): Promise<Reminder> {
    const all = await read<Reminder>(K.reminders);
    const updated = all.map((r) => r.id === id ? { ...r, status: 'completed' as const } : r);
    await write(K.reminders, updated);
    return updated.find((r) => r.id === id) as Reminder;
  },

  async clear(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const local = keys.filter((k) => k.startsWith('local:'));
    if (local.length > 0) await AsyncStorage.multiRemove(local);
  },
};
