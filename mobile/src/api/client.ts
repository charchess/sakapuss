import { AuthStore } from '../store/auth';
import { Endpoints } from '../constants/api';

export interface ApiError {
  status: number;
  message: string;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  skipAuth = false
): Promise<T> {
  const baseUrl = await AuthStore.getBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (!skipAuth) {
    const token = await AuthStore.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const options: RequestInit = { method, headers, signal: controller.signal };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      message = err.detail ?? err.message ?? message;
    } catch {
      // ignore parse errors
    }
    const error: ApiError = { status: response.status, message };
    throw error;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path);
  },

  post<T>(path: string, body: unknown, skipAuth = false): Promise<T> {
    return request<T>('POST', path, body, skipAuth);
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>('PUT', path, body);
  },

  delete<T>(path: string): Promise<T> {
    return request<T>('DELETE', path);
  },
};

// ---- Typed API calls ----

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    display_name: string;
    role: string;
  };
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  birth_date?: string;
  photo_url?: string;
}

export interface PetEvent {
  id: string;
  pet_id: string;
  pet_name?: string;
  type: string;
  occurred_at: string;
  payload: Record<string, unknown>;
}

export interface Reminder {
  id: string;
  pet_id: string;
  pet_name: string;
  name: string;
  type: string;
  frequency_days?: number;
  next_due_date: string;
  status: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string; // 'litter' | 'food_bowl' | 'water'
  color?: string;
  tracking_mode?: string;
  enabled: boolean;
  created_at: string;
}

export interface Bowl {
  id: string;
  name: string;
  location: string;
  capacity_g?: number;
  capacity_ml?: number;
  bowl_type: string; // 'food' | 'water'
  current_product_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Serving {
  id: string;
  bowl_id: string;
  bag_id?: string;
  pet_id?: string;
  served_at: string;
  amount_g?: number;
  amount_ml?: number;
  notes?: string;
}

export interface FoodProduct {
  id: string;
  name: string;
  brand: string;
  food_type: string;
  food_category: string;
  default_bag_weight_g?: number;
  created_at: string;
  updated_at: string;
}

export interface FoodBag {
  id: string;
  product_id: string;
  weight_g: number;
  purchased_at: string;
  opened_at?: string;
  depleted_at?: string;
  status: string; // 'stocked' | 'opened' | 'depleted'
  created_at: string;
  updated_at: string;
}

export const api = {
  login(email: string, password: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(Endpoints.login, { email, password }, true);
  },

  register(email: string, password: string, display_name: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(Endpoints.register, { email, password, display_name }, true);
  },

  getPets(): Promise<Pet[]> {
    return apiClient.get<Pet[]>(Endpoints.pets);
  },

  createPet(pet: { name: string; species: string; birth_date: string; breed?: string }): Promise<Pet> {
    return apiClient.post<Pet>(Endpoints.pets, pet);
  },

  getPetEvents(petId: string): Promise<PetEvent[]> {
    return apiClient.get<PetEvent[]>(Endpoints.petEvents(petId));
  },

  createPetEvent(
    petId: string,
    type: string,
    payload: Record<string, unknown>,
    occurredAt: string
  ): Promise<PetEvent> {
    return apiClient.post<PetEvent>(Endpoints.petEvents(petId), {
      type,
      payload,
      occurred_at: occurredAt,
    });
  },

  getAllEvents(limit = 50): Promise<PetEvent[]> {
    return apiClient.get<PetEvent[]>(`${Endpoints.allEvents}?limit=${limit}`);
  },

  getPendingReminders(): Promise<Reminder[]> {
    return apiClient.get<Reminder[]>(Endpoints.reminders);
  },

  completeReminder(reminderId: string): Promise<Reminder> {
    return apiClient.post<Reminder>(`/reminders/${reminderId}/complete`, {});
  },

  postponeReminder(reminderId: string, delayDays: number): Promise<Reminder> {
    return apiClient.post<Reminder>(`/reminders/${reminderId}/postpone`, { delay_days: delayDays });
  },

  createReminder(petId: string, data: { name: string; frequency_days: number; type?: string }): Promise<Reminder> {
    return apiClient.post<Reminder>(`/pets/${petId}/reminders`, { type: 'health', ...data });
  },

  deleteReminder(reminderId: string): Promise<void> {
    return apiClient.delete<void>(`/reminders/${reminderId}`);
  },

  // Resources (litières, etc.)
  getResources(type?: string): Promise<Resource[]> {
    const q = type ? `?type=${type}` : '';
    return apiClient.get<Resource[]>(`${Endpoints.resources}${q}`);
  },
  createResource(data: { name: string; type: string; color?: string; tracking_mode?: string }): Promise<Resource> {
    return apiClient.post<Resource>(Endpoints.resources, data);
  },
  updateResource(id: string, data: { name?: string; color?: string; enabled?: boolean }): Promise<Resource> {
    return request<Resource>('PATCH', Endpoints.resource(id), data);
  },
  deleteResource(id: string): Promise<void> {
    return apiClient.delete<void>(Endpoints.resource(id));
  },

  // Bowls (gamelles)
  getBowls(): Promise<Bowl[]> {
    return apiClient.get<Bowl[]>(Endpoints.bowls);
  },
  createBowl(data: { name: string; location: string; bowl_type: string; capacity_g?: number; capacity_ml?: number; current_product_id?: string }): Promise<Bowl> {
    return apiClient.post<Bowl>(Endpoints.bowls, data);
  },
  updateBowl(id: string, data: Partial<Bowl>): Promise<Bowl> {
    return apiClient.put<Bowl>(Endpoints.bowl(id), data);
  },
  deleteBowl(id: string): Promise<void> {
    return apiClient.delete<void>(Endpoints.bowl(id));
  },
  fillBowl(id: string, data: { pet_id?: string; amount_g?: number; amount_ml?: number; notes?: string; bag_id?: string }): Promise<Serving> {
    return apiClient.post<Serving>(Endpoints.bowlFill(id), {
      ...data,
      served_at: new Date().toISOString(),
    });
  },

  // Food products
  getFoodProducts(): Promise<FoodProduct[]> {
    return apiClient.get<FoodProduct[]>(Endpoints.foodProducts);
  },
  createFoodProduct(data: { name: string; brand: string; food_type: string; food_category: string; default_bag_weight_g?: number }): Promise<FoodProduct> {
    return apiClient.post<FoodProduct>(Endpoints.foodProducts, data);
  },
  deleteFoodProduct(id: string): Promise<void> {
    return apiClient.delete<void>(Endpoints.foodProduct(id));
  },

  // Food bags
  getFoodBags(status?: string): Promise<FoodBag[]> {
    const q = status ? `?bag_status=${status}` : '';
    return apiClient.get<FoodBag[]>(`${Endpoints.foodBags}${q}`);
  },
  createFoodBag(data: { product_id: string; weight_g: number; purchased_at: string }): Promise<FoodBag> {
    return apiClient.post<FoodBag>(Endpoints.foodBags, data);
  },
  openFoodBag(id: string): Promise<FoodBag> {
    return apiClient.post<FoodBag>(Endpoints.foodBagOpen(id), {});
  },
  depleteFoodBag(id: string): Promise<FoodBag> {
    return apiClient.post<FoodBag>(Endpoints.foodBagDeplete(id), {});
  },
};
