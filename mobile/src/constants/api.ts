export const DEFAULT_BASE_URL = 'http://localhost:8000';

export const Endpoints = {
  login: '/auth/login',
  register: '/auth/register',
  pets: '/pets',
  petEvents: (petId: string) => `/pets/${petId}/events`,
  allEvents: '/events',
  reminders: '/reminders/pending',
  syncPush: '/sync/push',
  syncPull: '/sync/pull',
  devices: '/devices',
  // Resources (litières, etc.)
  resources: '/resources',
  resource: (id: string) => `/resources/${id}`,
  // Bowls (gamelles)
  bowls: '/bowls',
  bowl: (id: string) => `/bowls/${id}`,
  bowlFill: (id: string) => `/bowls/${id}/fill`,
  bowlServings: (id: string) => `/bowls/${id}/servings`,
  // Food
  foodProducts: '/food/products',
  foodProduct: (id: string) => `/food/products/${id}`,
  foodBags: '/food/bags',
  foodBag: (id: string) => `/food/bags/${id}`,
  foodBagOpen: (id: string) => `/food/bags/${id}/open`,
  foodBagDeplete: (id: string) => `/food/bags/${id}/deplete`,
};
