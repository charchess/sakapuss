import { api, Pet, PetEvent, Resource, Bowl, Serving, FoodProduct, FoodBag, Reminder } from '../api/client';
import { localDb } from './localDb';
import { AuthStore } from './auth';
import { SyncQueue } from './syncQueue';
import { flushQueue } from '../api/sync';

async function isGuest(): Promise<boolean> {
  return AuthStore.isGuestMode();
}

export const dataService = {
  // ─── Pets ────────────────────────────────────────────────────────
  async getPets(): Promise<Pet[]> {
    if (await isGuest()) return localDb.getPets();
    return api.getPets();
  },

  async createPet(data: { name: string; species: string; birth_date: string; breed?: string }): Promise<Pet> {
    if (await isGuest()) return localDb.createPet(data);
    return api.createPet(data);
  },

  // ─── Events ──────────────────────────────────────────────────────
  async getPetEvents(petId: string): Promise<PetEvent[]> {
    if (await isGuest()) return localDb.getPetEvents(petId);
    return api.getPetEvents(petId);
  },

  async getAllEvents(limit = 50): Promise<PetEvent[]> {
    if (await isGuest()) return localDb.getAllEvents(limit);
    return api.getAllEvents(limit);
  },

  async logEvent(petId: string | null, type: string, payload: Record<string, unknown>): Promise<void> {
    if (await isGuest()) {
      if (petId) await localDb.createPetEvent(petId, type, payload);
      return;
    }
    if (petId) {
      await SyncQueue.enqueue({ petId, type, payload, occurredAt: new Date().toISOString() });
      flushQueue().catch((err) => console.warn('[sync] flushQueue error:', err));
    }
  },

  // ─── Resources ───────────────────────────────────────────────────
  async getResources(type?: string): Promise<Resource[]> {
    if (await isGuest()) return localDb.getResources(type);
    return api.getResources(type);
  },

  async createResource(data: { name: string; type: string; color?: string }): Promise<Resource> {
    if (await isGuest()) return localDb.createResource(data);
    return api.createResource(data);
  },

  async updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
    if (await isGuest()) return localDb.updateResource(id, data);
    return api.updateResource(id, data);
  },

  async deleteResource(id: string): Promise<void> {
    if (await isGuest()) return localDb.deleteResource(id);
    return api.deleteResource(id);
  },

  // ─── Bowls ───────────────────────────────────────────────────────
  async getBowls(): Promise<Bowl[]> {
    if (await isGuest()) return localDb.getBowls();
    return api.getBowls();
  },

  async createBowl(data: { name: string; location: string; bowl_type: 'food' | 'water'; capacity_g?: number }): Promise<Bowl> {
    if (await isGuest()) return localDb.createBowl(data);
    return api.createBowl(data);
  },

  async deleteBowl(id: string): Promise<void> {
    if (await isGuest()) return localDb.deleteBowl(id);
    return api.deleteBowl(id);
  },

  async fillBowl(id: string, data: { pet_id?: string; amount_g?: number; bag_id?: string }): Promise<Serving> {
    if (await isGuest()) return localDb.fillBowl(id, data);
    return api.fillBowl(id, data);
  },

  // ─── Food ─────────────────────────────────────────────────────────
  async getFoodProducts(): Promise<FoodProduct[]> {
    if (await isGuest()) return localDb.getFoodProducts();
    return api.getFoodProducts();
  },

  async createFoodProduct(data: {
    name: string; brand: string; food_type?: string;
    food_category?: string; default_bag_weight_g?: number;
  }): Promise<FoodProduct> {
    if (await isGuest()) return localDb.createFoodProduct(data);
    return api.createFoodProduct({ ...data, food_type: data.food_type ?? 'Croquettes', food_category: data.food_category ?? 'Principal' });
  },

  async deleteFoodProduct(id: string): Promise<void> {
    if (await isGuest()) return localDb.deleteFoodProduct(id);
    return api.deleteFoodProduct(id);
  },

  async getFoodBags(status?: string): Promise<FoodBag[]> {
    if (await isGuest()) return localDb.getFoodBags(status);
    return api.getFoodBags(status);
  },

  async createFoodBag(data: { product_id: string; weight_g: number; purchased_at?: string }): Promise<FoodBag> {
    if (await isGuest()) return localDb.createFoodBag(data);
    return api.createFoodBag({ ...data, purchased_at: data.purchased_at ?? new Date().toISOString().split('T')[0] });
  },

  async openFoodBag(id: string): Promise<FoodBag> {
    if (await isGuest()) return localDb.openFoodBag(id);
    return api.openFoodBag(id);
  },

  async depleteFoodBag(id: string): Promise<FoodBag> {
    if (await isGuest()) return localDb.depleteFoodBag(id);
    return api.depleteFoodBag(id);
  },

  // ─── Reminders ────────────────────────────────────────────────────
  async getPendingReminders(): Promise<Reminder[]> {
    if (await isGuest()) return localDb.getPendingReminders();
    return api.getPendingReminders();
  },

  async completeReminder(id: string): Promise<Reminder> {
    if (await isGuest()) return localDb.completeReminder(id);
    return api.completeReminder(id);
  },

  async postponeReminder(id: string, delayDays: number): Promise<Reminder> {
    if (await isGuest()) {
      const due = new Date();
      due.setDate(due.getDate() + delayDays);
      return localDb.completeReminder(id);
    }
    return api.postponeReminder(id, delayDays);
  },

  async createReminder(petId: string, data: { name: string; frequency_days: number; type?: string }): Promise<void> {
    if (await isGuest()) {
      const due = new Date();
      due.setDate(due.getDate() + data.frequency_days);
      await localDb.createReminder({
        pet_id: petId,
        name: data.name,
        type: data.type ?? 'health',
        frequency_days: data.frequency_days,
        next_due_date: due.toISOString(),
        status: 'upcoming',
      });
      return;
    }
    await api.createReminder(petId, data);
  },
};
