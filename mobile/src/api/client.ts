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

  const options: RequestInit = { method, headers };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

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
  next_due_date: string;
  status: string;
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
};
